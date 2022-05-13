const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, 
  {
  cors: {
    origin: "http://172.16.102.95",
    methods: ["GET", "POST"]
    }
  }
);
const cors = require("cors");
app.use(cors());

const TIME_LIMIT = 60
const users = {}
const queue = []

let timer = TIME_LIMIT
let currentRound = 0
let word = ""
let interval

io.on('connection', (socket) => {

  const newUser = (username) => {
    users[username] = socket.id
    queue.push(username)

    io.emit("users", users)

    if (nextInQueue(username)) io.to(users[username]).emit("choose-word")
  } 

  const emitArray = (array) => io.emit("draw-output", array)
  
  const startGame = (w) => {
    timer = TIME_LIMIT
    word = w
    interval = setInterval(()=>{
      timer--
      if(timer > 0){
        io.emit("timer", timer)
      } else {
        currentRound ++
        clearInterval(interval)
        io.emit("times-up")
        io.emit("draw-output",[])
        io.emit("clear")
        queue.forEach(player => {
          if(nextInQueue(player)) io.to(users[player]).emit("choose-word")
        })
      }
    }, 1000)
  }

  const makeGuess = (guess, username) => {
    if(guess === word){
      console.log(username, " won!")

      currentRound ++

      io.emit("win", username)
      io.emit("draw-output", [])
      io.emit("clear")
      clearInterval(interval)

      queue.forEach(player => {
        if(nextInQueue(player)) io.to(users[player]).emit("choose-word")
      })
      
    } else {
      io.to(users[username]).emit("wrong")
    }
  }

  const handleDisconnect = ( reason )=> {
    Object.entries(users).forEach(([key, value]) => {
      if(socket.id === value){
        delete users[key]
        console.log("USER: ", key, "disconnected, reason: ", reason)
      }
    })
  }

  socket.on("new-user", newUser)
  socket.on("draw-input", emitArray)
  socket.on("start-game", startGame)
  socket.on("guess", makeGuess)
  socket.on("disconnect", handleDisconnect)
});

function nextInQueue (user) {
  if(queue[currentRound % queue.length] === user) return true
  else return false
}

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
  
server.listen(3000, () => {
  console.log('listening on *:3000');
});