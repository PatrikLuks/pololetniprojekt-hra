const WebSocket = require('ws');

// Vytvori novy WebSocket server na portu 3000
const server = new WebSocket.Server({ port: 3000 });

let players = []; // Pole pro ukladani hracu

server.on('connection', (socket) => {
  // Pokud jsou pripojeni 2 hraci, zavre se nove pripojeni
  if (players.length >= 2) {
    socket.close();
    return;
  }

  // Prida noveho hrace do pole hracu
  players.push(socket);
  const playerNumber = players.length; // Cislo hrace
  socket.send(JSON.stringify({ type: 'init', player: playerNumber })); // Posle zpravu o hraci

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'update') {
      // Najde druheho hrace
      const opponent = players.find(p => p !== socket);
      if (opponent) {
        opponent.send(JSON.stringify(data)); // Posle zpravu protivnikovi
      }
    }
  });

  socket.on('close', () => {
    // Odstrani hrace z pole hracu pri odpojeni
    players = players.filter(p => p !== socket);
  });
});

// Vypise informaci o spustenem serveru
console.log('WebSocket server je spusten na ws://localhost:3000');
