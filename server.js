const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");
app.use(cors());

const users = {}
io.on('connection', (socket) => {
  socket.on("new-user", username => {
    console.log("CONNECTION")
    users[username] = socket.id
    io.emit("users", users);
  })
});


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
  
server.listen(3000, () => {
  console.log('listening on *:3000');
});