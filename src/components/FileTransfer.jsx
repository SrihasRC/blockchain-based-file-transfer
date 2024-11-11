import { useState, useCallback, useEffect } from 'react';
import { encryptFile, decryptFile, calculateHash, generateKey } from '../utils/crypto';
import { PhotoIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function FileTransfer({ peer, connected, peerId }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [receivingFile, setReceivingFile] = useState(false);
  const [receivedFile, setReceivedFile] = useState(null);

  useEffect(() => {
    if (peer) {
      peer.on('data', handleReceiveFile);
    }
    return () => {
      if (peer) {
        peer.off('data', handleReceiveFile);
      }
    };
  }, [peer]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('File selected');
    }
  };

  const sendFile = async () => {
    if (!file || !connected || !peer) return;

    try {
      setStatus('Preparing file...');
      const key = generateKey();
      const encrypted = await encryptFile(file, key);
      const hash = await calculateHash(file);

      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        key,
        hash,
        data: encrypted
      };

      peer.send({
        type: 'file-incoming',
        fileData
      });

      setStatus('File sent successfully');
      setFile(null);
    } catch (error) {
      setStatus('Error sending file: ' + error.message);
      console.error('Error sending file:', error);
    }
  };

  const handleReceiveFile = useCallback(async (data) => {
    if (!data || !data.type || data.type !== 'file-incoming') return;

    setReceivingFile(true);
    setStatus('Receiving file...');

    try {
      const { fileData } = data;
      const decrypted = decryptFile(
        fileData.data,
        fileData.key,
        fileData.name,
        fileData.type
      );

      const receivedHash = await calculateHash(decrypted);
      if (receivedHash !== fileData.hash) {
        throw new Error('File integrity check failed');
      }

      setReceivedFile({
        file: decrypted,
        name: fileData.name,
        size: fileData.size,
        type: fileData.type
      });
      setStatus('File received and verified');
    } catch (error) {
      setStatus('Error receiving file: ' + error.message);
      console.error('Error receiving file:', error);
    } finally {
      setReceivingFile(false);
    }
  }, []);

  const downloadReceivedFile = () => {
    if (!receivedFile) return;
    
    const url = URL.createObjectURL(receivedFile.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = receivedFile.name;
    a.click();
    URL.revokeObjectURL(url);
    setReceivedFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center">
        {!receivedFile ? (
          <>
            <label
              className="w-full h-64 flex flex-col items-center justify-center
                       border-2 border-dashed border-gray-700 rounded-lg
                       bg-[#1a1f2e] hover:bg-[#2a2f3e] transition-colors
                       cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <PhotoIcon className="h-16 w-16 text-gray-500 group-hover:text-gray-400 mb-4" />
                <p className="text-sm text-gray-400 text-center">
                  <span className="font-semibold">Upload a file</span>
                  <br />
                  Any file type up to 2GB
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-4 text-sm text-gray-400">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            <button
              onClick={sendFile}
              disabled={!file || !connected || !peer}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors w-full"
            >
              Send File
            </button>
          </>
        ) : (
          <div className="w-full p-6 bg-[#1a1f2e] rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">File Received</h3>
                <p className="text-sm text-gray-400">
                  {receivedFile.name} ({(receivedFile.size / 1024).toFixed(2)} KB)
                </p>
              </div>
              <button
                onClick={downloadReceivedFile}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 
                         text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className="mt-4 text-sm text-gray-400">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}