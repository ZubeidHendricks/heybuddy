// webrtc.js
class WebRTCServer {
    static peers = new Map();
  
    static initializeConnection(socket, sessionId) {
      // Handle WebRTC signaling
      socket.on('webrtc_signal', ({ targetId, signal }) => {
        socket.to(targetId).emit('webrtc_signal', {
          sourceId: socket.id,
          signal
        });
      });
  
      // Handle ICE candidates
      socket.on('ice_candidate', ({ targetId, candidate }) => {
        socket.to(targetId).emit('ice_candidate', {
          sourceId: socket.id,
          candidate
        });
      });
  
      // Handle voice chat setup
      socket.on('voice_start', () => {
        socket.to(sessionId).emit('voice_started', { userId: socket.id });
      });
  
      socket.on('voice_end', () => {
        socket.to(sessionId).emit('voice_ended', { userId: socket.id });
      });
    }
  }
  
  module.exports = { WebRTCServer };