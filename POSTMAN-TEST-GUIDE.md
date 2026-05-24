# Chatter-Box Socket.IO - Postman Test Payloads

## Create Room
```json
{
  "name": "general"
}
```

## Join Room
```json
{
  "roomName": "general",
  "username": "alice"
}
```

## Get Message History
```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Send Message
```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "alice",
  "text": "Hello, how is everyone?"
}
```

## Send Reaction
```json
{
  "roomName": "general",
  "emoji": "❤️",
  "username": "alice"
}
```

## Leave Room
```json
{
  "roomName": "general",
  "username": "alice"
}
```

---

## Testing Steps

1. **Connect** to Socket.IO at `http://localhost:3000`

2. **Create a room** - Emit `create-room`:
   ```json
   {
     "name": "general"
   }
   ```
   Listen for `room-created` event

3. **Join the room** - Emit `join-room`:
   ```json
   {
     "roomName": "general",
     "username": "alice"
   }
   ```
   Listen for `user-joined` event

4. **Get message history** - Emit `get-message-history`:
   ```json
   {
     "roomId": "COPY_ID_FROM_ROOM_CREATED"
   }
   ```
   Listen for `message-history` event

5. **Send a message** - Emit `send-message`:
   ```json
   {
     "roomId": "COPY_ID_FROM_ROOM_CREATED",
     "username": "alice",
     "text": "Hello, how is everyone?"
   }
   ```
   Listen for `receive-message` event

6. **Send a reaction** - Emit `send-reaction`:
   ```json
   {
     "roomName": "general",
     "emoji": "❤️",
     "username": "alice"
   }
   ```
   Listen for `receive-reaction` event

7. **Leave the room** - Emit `leave-room`:
   ```json
   {
     "roomName": "general",
     "username": "alice"
   }
   ```
   Listen for `user-left` event
