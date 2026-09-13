import React, { useEffect, useRef, useState } from "react";
import { useWebRTC } from "../../Contexts/WebRTCContext";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

export const CallOverlay: React.FC = () => {
  const {
    localStream,
    remoteStream,
    callStatus,
    caller,
    answerCall,
    declineCall,
    endCall,
  } = useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    console.log('CallOverlay: callStatus changed to:', callStatus);
  }, [callStatus]);

  // Bind local stream to video element
  useEffect(() => {
    console.log('Local stream effect triggered:', localStream);
    if (localVideoRef.current && localStream) {
      console.log('Setting local video source:', localStream);
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  // Bind remote stream to video element
  useEffect(() => {
    console.log('Remote stream effect triggered:', remoteStream);
    if (remoteVideoRef.current && remoteStream) {
      console.log('Setting remote video source:', remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  // Handle Mute Mic
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Handle Toggle Camera
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (callStatus === "idle") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white animate-fade-in p-4">
      {/* 1. RINGING STATE (INCOMING CALL) */}
      {callStatus === "ringing" && (
        <div className="flex flex-col items-center space-y-6 text-center max-w-sm w-full bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <div className="relative">
            {caller?.profile_pic ? (
              <img
                src={caller.profile_pic}
                alt={caller.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-green-500 animate-pulse"
              />
            ) : (
              <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center text-4xl font-bold ring-4 ring-green-500 animate-pulse">
                {caller?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              {caller?.first_name
                ? `${caller.first_name} ${caller.last_name || ""}`
                : caller?.username}
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              Incoming Video Call...
            </p>
          </div>

          <div className="flex items-center space-x-6 w-full pt-4 justify-center">
            <button
              onClick={declineCall}
              className="p-4 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full text-white transition-all shadow-lg hover:scale-105"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={answerCall}
              className="p-4 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-full text-white transition-all shadow-lg hover:scale-105"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 2. CALLING STATE (OUTGOING CALL) */}
      {callStatus === "calling" && (
        <div className="flex flex-col items-center space-y-6 text-center max-w-sm w-full bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <div className="relative">
            {caller?.profile_pic ? (
              <img
                src={caller.profile_pic}
                alt={caller.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500 animate-pulse"
              />
            ) : (
              <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center text-4xl font-bold ring-4 ring-blue-500 animate-pulse">
                {caller?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              {caller?.first_name
                ? `${caller.first_name} ${caller.last_name || ""}`
                : caller?.username}
            </h3>
            <p className="text-neutral-400 text-sm mt-1">Calling...</p>
          </div>

          {/* Local Preview during Outgoing Call */}
          <div className="w-40 h-28 bg-black rounded-lg overflow-hidden border border-neutral-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          </div>

          <button
            onClick={endCall}
            className="p-4 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full text-white transition-all shadow-lg hover:scale-105"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 3. CONNECTED STATE (ACTIVE VIDEO CALL) */}
      {callStatus === "connected" && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
          {/* Remote Video (Full Screen background) */}
          <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-neutral-400">Connecting video streams...</p>
              </div>
            )}
          </div>

          {/* Local Video (Floating Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-32 h-44 sm:w-40 sm:h-56 bg-neutral-900 border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${isVideoOff ? "hidden" : ""}`}
            />
            {isVideoOff && (
              <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-400 text-xs text-center p-2">
                Camera Off
              </div>
            )}
          </div>

          {/* Overlay Caller Name at top-left */}
          <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-lg z-10 backdrop-blur-sm">
            <h4 className="text-sm font-medium">
              {caller?.first_name
                ? `${caller.first_name} ${caller.last_name || ""}`
                : caller?.username}
            </h4>
          </div>

          {/* Control Bar at Bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 px-6 py-3 bg-black/70 border border-neutral-800 rounded-full shadow-2xl z-20 backdrop-blur-md">
            {/* Toggle Microphone */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full transition-all hover:scale-105 ${
                isMuted
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="p-4 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full text-white transition-all shadow-lg hover:scale-105"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Toggle Camera */}
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-full transition-all hover:scale-105 ${
                isVideoOff
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
