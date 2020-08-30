const app = require('express')();
const http = require('http').createServer(app);
let randomColor = require('randomcolor');
const io = require('socket.io')(http);
const uuid = require('uuid');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = [];
const usersTypingList = [];

io.on('connection', (socket) => {
  let color = randomColor();

  socket.username = 'Anonymous';
  socket.color = color;

  //listen on change_username
  socket.on('change_username', nickName => {
    let id = uuid.v4(); // create a random id for the user
    socket.id = id;
    socket.username = nickName;
    users.push({id, username: socket.username, color: socket.color});
    io.emit('user connected', nickName + ' has joined the conversation.');
    updateUsernames();
  })

  const updateUsernames = () => {
    io.emit('get users', users)
  }

  socket.on('disconnect', () => {
    if (!socket.username) {
      return;
    }

    if (socket.username == 'Anonymous') {
      return;
    }

    let user = undefined;
    for (let i= 0; i < users.length; i++) {
      if (users[i].id === socket.id) {
        user = users[i];
        break;
      }
    }
    users.splice(user,1);

    updateUsernames();

    socket.broadcast.emit('user disconnected', socket.username + ' has left the conversation.');
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

  const emitUsersTypingIfNeeded = (usersTypingList, socket) => {
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
