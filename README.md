# daten_backend
The server for my daten web app - a web app just like Tinder but allows users to chat privately & post daily activities

## Tech stacks: 
- MERN stack
- Redis cache
- SocketIO
- WebRTC (simple-peer)

I will discuss about technologies and how I implement each features in future commits.

## DEMO
[![Video demo of this web app](https://img.youtube.com/vi/3JdFshvJmIo/0.jpg)](https://www.youtube.com/watch?v=3JdFshvJmIo)

## Features:
- [x] Authentication (Auth, OAuth2)
- [x] Profile
- [x] Matching
- [x] Chatting (developing **socket**)
- [x] Video Call (**simple-peer**)
- [-] Private Chatting
- [-] Post Activities


## How implement these features:
### Matching
- How server only serves unseen profiles for each user based on their activity? I used [Bloom Filter](https://en.wikipedia.org/wiki/Bloom_filter) - A space-efficient probabilistic data structure. Each time the user swipe right(or left) someone, server adds the pair userID_someoneID to Bloom Filter structure. When they request others profiles, server just serves the profiles that userID_someoneID don't exist in this structure. This structure will be stored into a file in server.

### Realtime chat (Socket.io)
- **Server** manages userId-socketId pairs
- Socket in **client** listens the new message event.
- An user A chat a new message to user B:
    - user A post new message to **server**, **server** will create new **Message** doc in MongoDB 
    - After created, **server** emits this message to the socketIds correspond with the receiver id and the sender id in order that they will receive created message
- The reason why the sender waiting the **server** emits the created message is that we want to show the successfully created message

### Video call ([Simple-Peer](https://www.npmjs.com/package/simple-peer), Socket.io)
- Caller will notify the target user they want to call (by **socket**), if the target user accept, they will create a room chat (randomly id by **chance**) and open new window to join this room 
- Each user joined room automatically create a new socket that join this roomID, the main purpose of this socket connection is that listen events in the call (Ex: new user joined room, user leave room, turn on/off video, ...)
- If new users join room, the room will create videos with the source is their streams

- I develop this feature based on the code example of this [repo](https://github.com/Kannndev/webrtc-video-call-react).