const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

let players = [];

server.on('connection', (socket) => {
  if (players.length >= 2) {
    socket.close();
    return;
  }

  players.push(socket);
  const playerNumber = players.length;
  socket.send(JSON.stringify({ type: 'init', player: playerNumber }));

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'update') {
      const opponent = players.find(p => p !== socket);
      if (opponent) {
        opponent.send(JSON.stringify(data));
      }
    }
  });

  socket.on('close', () => {
    players = players.filter(p => p !== socket);
  });
});

console.log('WebSocket server is running on ws://localhost:3000');
