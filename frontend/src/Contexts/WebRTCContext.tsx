import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWebSocket } from "./WebSocketContext";
import { useUser } from "./Usercontext";
import { Utilisateur } from "../types/types";

interface WebRTCContextType {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: "idle" | "ringing" | "calling" | "connected";
  caller: Partial<Utilisateur> | null;
  callUser: (receiverId: number, receiverData: Partial<Utilisateur>) => void;
  answerCall: () => void;
  declineCall: () => void;
  endCall: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useWebSocket();
  const currentUser = useUser() as Utilisateur | null;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<
    "idle" | "ringing" | "calling" | "connected"
  >("idle");
  const [caller, setCaller] = useState<Partial<Utilisateur> | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && caller?.id) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.send(
          JSON.stringify({
            command: "ice-candidate",
            receiver_id: caller.id,
            candidate: event.candidate,
          }),
        );
      }
    };

    pc.ontrack = (event) => {
      console.log('ontrack event received:', event);
      if (event.streams && event.streams.length > 0) {
        console.log('Remote stream received:', event.streams[0]);
        setRemoteStream(event.streams[0]);
      } else {
        console.warn('No streams in ontrack event');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
    };

    return pc;
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setRemoteStream(null);
    setCallStatus("idle");
    setCaller(null);
    pendingCandidates.current = [];
  };

  const callUser = async (
    receiverId: number,
    receiverData: Partial<Utilisateur>,
  ) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setCaller({ id: receiverId, ...receiverData });
      setCallStatus("calling");

      const pc = createPeerConnection();
      console.log('Adding local tracks to peer connection:', stream.getTracks());
      stream.getTracks().forEach((track) => {
        console.log('Adding track:', track.kind, track.label);
        pc.addTrack(track, stream);
      });
      peerConnection.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Created and set local offer:', offer);

      if (socket) {
        console.log('Sending call offer to:', receiverId);
        socket.send(
          JSON.stringify({
            command: "call-offer",
            receiver_id: receiverId,
            offer: offer,
            sender_data: {
              id: currentUser?.id,
              username: currentUser?.username,
              firstname: currentUser?.first_name,
              lastname: currentUser?.last_name,
              profile_pic: currentUser?.profile_pic,
            },
          }),
        );
      }
    } catch (err) {
      if (err.name === "NotFoundError") {
        console.warn(
          "Camera or microphone not found. Proceeding without media devices.",
        );
        setLocalStream(null); // Ensure localStream is null if media devices are not found
      } else {
        console.error("Error starting call:", err);
        cleanup();
      }
    }
  };

  const answerCall = async () => {
    if (!caller || !socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const pc = peerConnection.current!; // Should have been created during offer handling
      console.log('Adding local tracks to peer connection in answerCall:', stream.getTracks());
      stream.getTracks().forEach((track) => {
        console.log('Adding track in answerCall:', track.kind, track.label);
        pc.addTrack(track, stream);
      });

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Created and set local answer:', answer);

      setLocalStream(stream);
      setCallStatus("connected");

      console.log('Sending call answer to:', caller.id);
      socket.send(
        JSON.stringify({
          command: "call-answer",
          receiver_id: caller.id,
          answer: answer,
        }),
      );

      // Add any pending candidates
      console.log('Processing pending ICE candidates:', pendingCandidates.current.length);
      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) {
          console.log('Adding pending ICE candidate:', candidate);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    } catch (err) {
      console.error("Error answering call:", err);
      cleanup();
    }
  };

  const declineCall = () => {
    if (caller && socket) {
      socket.send(
        JSON.stringify({
          command: "call-declined",
          receiver_id: caller.id,
        }),
      );
    }
    cleanup();
  };

  const endCall = () => {
    if (caller && socket) {
      socket.send(
        JSON.stringify({
          command: "call-ended",
          receiver_id: caller.id,
        }),
      );
    }
    cleanup();
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.command) {
        case "call-offer":
          console.log('Received call offer:', data);
          setCaller(data.sender_data);
          setCallStatus("ringing");

          // Pre-create PC to set remote description
          const pc = createPeerConnection();
          peerConnection.current = pc;
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          console.log('Remote description set for offer');
          break;

        case "call-answer":
          console.log('Received call answer:', data);
          if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(data.answer),
            );
            console.log('Remote description set for answer');
            setCallStatus("connected");
          }
          break;

        case "ice-candidate":
          const candidate = data.candidate;
          console.log('Received ICE candidate:', candidate);
          if (
            peerConnection.current &&
            peerConnection.current.remoteDescription
          ) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(candidate),
            );
            console.log('ICE candidate added');
          } else {
            console.log('Storing pending ICE candidate');
            pendingCandidates.current.push(candidate);
          }
          break;

        case "call-declined":
        case "call-ended":
          cleanup();
          break;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        remoteStream,
        callStatus,
        caller,
        callUser,
        answerCall,
        declineCall,
        endCall,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) throw new Error("useWebRTC must be used within WebRTCProvider");
  return context;
};