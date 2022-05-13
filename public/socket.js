const socket = io("http://172.16.102.95:3000");
const userList = document.getElementById("users");
const guessBox = document.getElementById("guess-box");
const submitGuess = document.getElementById("submit-guess")
let username = ""

socket.on("connect", () => {
    username = window.prompt("USERNAME","John name");
    socket.emit("new-user", username)
})

socket.on("users", (u) => {
    removeAllChildNodes(userList);
    const users =  Object.keys(u);
    for(let i = 0; i < users.length; i++) {
        const gameTag = document.createElement("h1")
        gameTag.innerHTML = users[i];
        userList.append(gameTag);
    }
})

socket.on("draw-output", (draw) => {
    linesArray = draw;
    redraw();
})

socket.on("choose-word", ()=>{
    const word = window.prompt("choose word")
    // setPlaying to true
    isPlaying = true
    socket.emit("start-game", word)
})

socket.on("timer", time => {
    document.getElementById("timer").innerHTML = time
})

socket.on("win", (winner) => {
    if(isPlaying) isPlaying = false
    window.alert(winner + " WINNER WINNER CHICKEN DINNER")
})

socket.on("clear", () => createCanvas())


socket.on("wrong", ()=>{
    guessBox.value = ""
})

submitGuess.addEventListener("click", () => {
    guess(guessBox.value);
})

function guess (word) {
    socket.emit("guess", word, username)
}

function sendDrawData(array) {
    socket.emit("draw-input", array)
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}