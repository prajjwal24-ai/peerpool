// src/components/VideoCall.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';

// Google ke public STUN servers (mesh network routing ke liye)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Remote video render karne ke liye helper component
const RemoteVideo = ({ stream, peerID }) => {
  const videoRef = useRef();
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative h-64 md:h-auto rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
        Peer: {peerID.substring(0, 4)}
      </span>
    </div>
  );
};

const VideoCall = ({ socket, roomID, onLeave }) => {
  const [peers, setPeers] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const userVideoRef = useRef();
  const peersRef = useRef([]); // Isme connection instances store rahenge
  const userStreamRef = useRef();

  useEffect(() => {
    // 1. Camera aur Mic ki permission mango
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        
        // 2. Room join karo
        socket.emit('join-call', roomID);

        // 3. Existing users ko Offer bhejo
        socket.on('all-users', (users) => {
          users.forEach((userID) => {
            const peerConnection = createPeer(userID, socket.id, stream);
            peersRef.current.push({ peerID: userID, connection: peerConnection });
          });
        });

        // 4. Naya user aaye toh uska Offer accept karke Answer banao
        socket.on('user-joined', async (payload) => {
          const peerConnection = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({ peerID: payload.callerID, connection: peerConnection });
        });

        // 5. Aapke Offer ka Answer aaye toh description set karo
        socket.on('receiving-returned-signal', async (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) {
            await item.connection.setRemoteDescription(new RTCSessionDescription(payload.signal));
          }
        });

        // 6. ICE candidates (network paths) exchange karo
        socket.on('receive-ice-candidate', async (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.sender);
          if (item && payload.candidate) {
            await item.connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
          }
        });

        // 7. Koi call chhod de toh uska video hatao
        socket.on('user-disconnected', (peerID) => {
          const peerObj = peersRef.current.find((p) => p.peerID === peerID);
          if (peerObj) peerObj.connection.close();
          peersRef.current = peersRef.current.filter((p) => p.peerID !== peerID);
          setPeers((prev) => prev.filter((p) => p.peerID !== peerID));
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
        alert("Camera or Microphone permission denied.");
      });

    // Cleanup function jab component unmount ho (Strict Mode fix)
    return () => {
      cleanupResources();
    };
  }, [roomID, socket]);

  // Peer banane ka logic (Caller ke liye)
  const createPeer = (userToSignal, callerID, stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', { target: userToSignal, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => {
        if (prev.find((p) => p.peerID === userToSignal)) return prev;
        return [...prev, { peerID: userToSignal, stream: event.streams[0] }];
      });
    };

    pc.createOffer().then((offer) => {
      pc.setLocalDescription(offer);
      socket.emit('send-offer', { userToSignal, callerID, signal: offer });
    });

    return pc;
  };

  // Peer add karne ka logic (Receiver ke liye)
  const addPeer = (incomingSignal, callerID, stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', { target: callerID, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => {
        if (prev.find((p) => p.peerID === callerID)) return prev;
        return [...prev, { peerID: callerID, stream: event.streams[0] }];
      });
    };

    pc.setRemoteDescription(new RTCSessionDescription(incomingSignal)).then(() => {
      pc.createAnswer().then((answer) => {
        pc.setLocalDescription(answer);
        socket.emit('returning-signal', { signal: answer, callerID });
      });
    });

    return pc;
  };

  // Buttons ke functions
  const toggleAudio = () => {
    const audioTrack = userStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = userStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  // Safe background cleanup
  const cleanupResources = () => {
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peersRef.current.forEach(({ connection }) => connection.close());
    socket.emit('leave-call');
  };

  // When user actually clicks the red hang-up button
  const handleHangUp = () => {
    cleanupResources();
    onLeave(); // Parent component (GroupChat) ko batane ke liye ki modal close karo
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950 rounded-lg overflow-hidden">
      {/* Videos Grid */}
      <div className="flex-1 p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr overflow-y-auto">
        
        {/* Aapka apna video */}
        <div className="relative h-64 md:h-auto rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
          <video
            ref={userVideoRef}
            muted
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 font-medium flex flex-col items-center gap-2">
                <VideoOff size={32} />
                Camera Off
              </span>
            </div>
          )}
          <span className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
            You {isAudioMuted && '(Muted)'}
          </span>
        </div>

        {/* Baki sabke videos */}
        {peers.map((peer) => (
          <RemoteVideo key={peer.peerID} stream={peer.stream} peerID={peer.peerID} />
        ))}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-6 px-4">
        <button 
          onClick={toggleAudio} 
          className={`p-4 rounded-full transition-all duration-200 ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {isAudioMuted ? <MicOff className="text-white" size={24} /> : <Mic className="text-white" size={24} />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          className={`p-4 rounded-full transition-all duration-200 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {isVideoOff ? <VideoOff className="text-white" size={24} /> : <VideoIcon className="text-white" size={24} />}
        </button>
        
        {/* Updated Button logic here */}
        <button 
          onClick={handleHangUp} 
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
        >
          <PhoneOff className="text-white" size={24} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;