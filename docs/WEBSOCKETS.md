# WebSocket / Socket.IO

Connect to `http://localhost:4000` and subscribe:

```ts
socket.emit('subscribe', { locationId: 'demo-location-1-1' });
socket.on('queue:update', console.log);
socket.on('wait-time:update', console.log);
socket.on('crowd:update', console.log);
socket.on('incident:update', console.log);
```

Rooms use `location:{locationId}`. Send `unsubscribe` with the same payload when leaving a location screen.
