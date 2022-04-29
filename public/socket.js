const socket = io("http://172.16.102.95:3000");
const userDiv = document.getElementById("users");

socket.on("connect", () => {
    const username = window.prompt("USERNAME");
    socket.emit("new-user", username)
})

socket.on("users", (u) => {
    const users =  Object.keys(u);
    for(let i = 0; i < users.length; i++) {
        const gameTag = document.createElement("h1")
        gameTag.innerHTML = users[i];
        userDiv.append(gameTag);
    }
})