// ShoppingClient.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { SharedShoppingExperience } from './SharedShoppingExperience';

const ShoppingClient = () => {
  const [sessionId, setSessionId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentView, setCurrentView] = useState(null);
  const [cursors, setCursors] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(true);

  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef();

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io(process.env.REACT_APP_SERVER_URL);
    
    // Initialize user media for voice chat
    initializeMedia();

    // Socket event listeners
    setupSocketListeners();

    return () => {
      socketRef.current.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      console.error('Failed to get user media:', err);
    }
  };

  const setupSocketListeners = () => {
    socketRef.current.on('session_created', ({ sessionId, state }) => {
      setSessionId(sessionId);
      updateSessionState(state);
    });

    socketRef.current.on('participant_joined', ({ state }) => {
      updateSessionState(state);
      // Initialize WebRTC connection with new participant
      if (streamRef.current) {
        initializePeerConnection(state.participants);
      }
    });

    socketRef.current.on('view_updated', ({ view }) => {
      setCurrentView(view);
    });

    socketRef.current.on('cursor_updated', ({ userId, position }) => {
      setCursors(prev => ({ ...prev, [userId]: position }));
    });

    socketRef.current.on('webrtc_signal', ({ sourceId, signal }) => {
      if (peersRef.current[sourceId]) {
        peersRef.current[sourceId].signal(signal);
      }
    });

    socketRef.current.on('ice_candidate', ({ sourceId, candidate }) => {
      if (peersRef.current[sourceId]) {
        peersRef.current[sourceId].addIceCandidate(candidate);
      }
    });
  };

  const initializePeerConnection = (participants) => {
    participants.forEach(([userId, userData]) => {
      if (userId !== socketRef.current.id && !peersRef.current[userId]) {
        const peer = new Peer({
          initiator: true,
          stream: streamRef.current,
          trickle: true
        });

        peer.on('signal', signal => {
          socketRef.current.emit('webrtc_signal', {
            targetId: userId,
            signal
          });
        });

        peer.on('stream', stream => {
          // Handle incoming audio stream
          const audio = new Audio();
          audio.srcObject = stream;
          audio.play();
        });

        peersRef.current[userId] = peer;
      }
    });
  };

  const createSession = () => {
    socketRef.current.emit('create_session', {
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      userName: 'User ' + Math.floor(Math.random() * 1000)
    });
  };

  const joinSession = (sessionId) => {
    socketRef.current.emit('join_session', {
      sessionId,
      userId: 'user-' + Math.random().toString(36).substr(2, 9),
      userName: 'User ' + Math.floor(Math.random() * 1000)
    });
  };

  const updateSessionState = (state) => {
    setParticipants(state.participants);
    setCursors(Object.fromEntries(state.cursors));
    setCurrentView(state.currentView);
  };

  const handleCursorMove = (position) => {
    if (sessionId) {
      socketRef.current.emit('cursor_move', {
        sessionId,
        position
      });
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  return (
    <SharedShoppingExperience
      sessionId={sessionId}
      participants={participants}
      cursors={cursors}
      isMuted={!audioEnabled}
      onCreateSession={createSession}
      onJoinSession={joinSession}
      onCursorMove={handleCursorMove}
      onToggleAudio={toggleAudio}
    />
  );
};

export default ShoppingClient;