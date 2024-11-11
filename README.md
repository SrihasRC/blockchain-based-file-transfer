# Decentralized P2P File Sharing System

A secure, browser-based peer-to-peer file sharing application built with React and WebRTC.

## Features

- Direct peer-to-peer file transfer using WebRTC
- End-to-end encryption using AES
- File integrity verification using SHA-256
- Real-time connection status updates
- No server-side file storage
- Download button for recipients to manually download files

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the signaling server:
   ```bash
   npm run server
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage Guide

1. **Connecting to Peers**
   - Copy your Peer ID and share it with another user
   - Enter their Peer ID in the "Connect to Peer" input
   - Click "Connect" to establish the connection

2. **Sharing Files**
   - Click "Choose File" to select a file from your device
   - Click "Send File" to initiate the transfer
   - The recipient will see a Download button to manually download the file after it is received.

3. **Security Features**
   - Files are encrypted using AES before transfer
   - SHA-256 hashing ensures file integrity
   - Direct P2P transfer means files never touch a server

## Troubleshooting

- **Connection Issues**
  - Ensure both peers are using compatible browsers (Chrome, Firefox, Edge)
  - Check that your firewall isn't blocking WebRTC connections
  - Verify both peers have entered the correct Peer IDs

- **File Transfer Problems**
  - Large files may take longer to process due to encryption
  - If a transfer fails, try reconnecting to the peer
  - Ensure you have sufficient storage space for received files

## Security Information

- All file transfers are encrypted end-to-end using AES-256
- File integrity is verified using SHA-256 hashing
- No data is stored on any servers
- Direct peer-to-peer connections ensure privacy

## Limitations

- Maximum file size depends on available browser memory
- Requires modern browser with WebRTC support
- Both peers must be online simultaneously for transfer

## Future Enhancements

- Multi-peer support for group file sharing
- Resume interrupted transfers
- Built-in chat functionality
- Peer discovery system
- Transfer progress visualization
- File preview capabilities