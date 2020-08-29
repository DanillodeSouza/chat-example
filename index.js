var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let usersTypingList = [];
io.on('connection', (socket) => {
  io.emit('connected', 'User has connected');
  socket.on('disconnect', () => {
    io.emit('user disconnected', 'User has disconnected');
  });
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('typing', (user) => {
    if (usersTypingList.indexOf(user) == -1) {
      usersTypingList.push(user);
    }

    emitUsersTypingIfNeeded(usersTypingList, socket);
  });
  socket.on('not typing', (user) => {
    let indexOf = usersTypingList.indexOf(user);
    if (indexOf == -1) {
      return;
    }

    usersTypingList.splice(indexOf, 1);

    emitUsersTypingIfNeeded(usersTypingList, socket);
  });

  function emitUsersTypingIfNeeded(usersTypingList, socket) {
    if (usersTypingList.length == 0) {
      io.emit('typing', '');
      return;
    }

    usersTyping = usersTypingList.join(', ');
    isOrAreTyping = ' is typing...'
    if (usersTypingList.length > 1) {
      isOrAreTyping = ' are typing...';
    }
    io.emit('typing', usersTyping + isOrAreTyping);
  }
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
