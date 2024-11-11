import { useState, useEffect, useCallback } from 'react';
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export default function PeerConnection({ onPeerConnection, onPeerUpdate }) {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      setPeerId(id);
      setStatus('Ready');
    });

    newPeer.on('connection', (conn) => {
      handleConnection(conn);
    });

    newPeer.on('error', (error) => {
      console.error('Peer error:', error);
      setStatus('Connection error');
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, []);

  const handleConnection = useCallback((conn) => {
    setConnection(conn);
    setStatus('Connected');
    setRemotePeerId(conn.peer);
    onPeerUpdate(conn, true);
    
    conn.on('data', (data) => {
      onPeerConnection(data);
    });

    conn.on('close', () => {
      setStatus('Ready');
      setConnection(null);
      setRemotePeerId('');
      onPeerUpdate(null, false);
    });
  }, [onPeerConnection, onPeerUpdate]);

  const connectToPeer = () => {
    if (!peer || !remotePeerId) return;
    const conn = peer.connect(remotePeerId);
    handleConnection(conn);
  };

  const disconnect = () => {
    if (connection) {
      connection.close();
      setStatus('Ready');
      setConnection(null);
      setRemotePeerId('');
      onPeerUpdate(null, false);
    }
  };

  const copyPeerId = async () => {
    try {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Your Peer ID
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={peerId}
            readOnly
            className="flex-1 px-4 py-3 bg-[#1a1f2e] rounded-lg
                     text-gray-200 focus:outline-none
                     border border-gray-700"
          />
          <button
            onClick={copyPeerId}
            className="px-4 py-3 bg-[#1a1f2e] rounded-lg
                     hover:bg-[#2a2f3e] transition-colors
                     border border-gray-700"
            title="Copy Peer ID"
          >
            <ClipboardDocumentIcon className="h-5 w-5 text-gray-300" />
          </button>
        </div>
        {copied && (
          <span className="text-sm text-green-400">
            Copied to clipboard!
          </span>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Connect to Peer
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            placeholder="Enter peer ID"
            className="flex-1 px-4 py-3 border border-gray-700
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                     bg-[#1a1f2e] text-gray-200 placeholder-gray-500"
          />
          {!connection ? (
            <button
              onClick={connectToPeer}
              disabled={!remotePeerId}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-6 py-3 bg-red-600 text-white rounded-lg
                       hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <div className={`w-2 h-2 rounded-full ${
          status === 'Connected' ? 'bg-green-400' :
          status === 'Ready' ? 'bg-yellow-400' :
          'bg-red-400'
        }`}></div>
        <span>Status: {status}</span>
        {connection && (
          <span className="ml-2">
            (Connected to: {remotePeerId})
          </span>
        )}
      </div>
    </div>
  );
}