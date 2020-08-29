var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  io.emit('connected', 'User has connected');
  socket.on('disconnect', () => {
    io.emit('user disconnected', 'User has disconnected');
  });
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('typing', (msg) => {
    socket.broadcast.emit('typing', msg);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
