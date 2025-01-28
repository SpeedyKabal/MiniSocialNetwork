class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  connect(url, roomName = "") {
    const path = url + roomName + "/";

    this.socketRef = new WebSocket(path);

    this.socketRef.onopen = () => {
      console.log("WebSocket open");
    };

    this.socketRef.onmessage = (e) => {
      this.receivedMessage(e.data);
    };

    this.socketRef.onerror = (e) => {
      console.error("WebSocket error", e);
    };

    this.socketRef.onclose = (e) => {
      console.log(e);
    };
  }

  receivedMessage(data) {
    const parsedData = JSON.parse(data);
    const command = parsedData.command;

    if (this.callbacks[command]) {
      this.callbacks[command](parsedData);
    } else {
      console.error(`No callback registered for command: ${command}`);
    }
  }

  addCallback(command, callback) {
    this.callbacks[command] = callback;
  }

  sendaMessage(message) {
    this.socketRef.send(JSON.stringify(message));
  }

  sendOfflineMessage(message) {
    if (this.socketRef && this.socketRef.readyState == WebSocket.OPEN) {
      console.log("Sending offline message to server:", message);
      this.logToLocalStorage(
        "Sending offline message to server: " + JSON.stringify(message)
      );
      this.socketRef.send(JSON.stringify(message));
    } else {
      alert("WebSocket is not open, cannot send offline message");
    }
  }
}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;
