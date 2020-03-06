import express from "express";
import http from "http";
import socketio from "socket.io";

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static("public"));

let messages = [];
let users = [];

function pushMessage({ id, username, message }) {
  messages = [{ id, username, message }, ...messages];
}

const userFunctions = {
  add: function({ id, username }) {
    users.push({
      id,
      username
    });
    renderUsers();
  },
  remove: function({ id }) {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      user.id === id ? users.splice(i, 1) : null;
    }
    renderUsers();
  }
};

function renderUsers() {
  sockets.emit("users-render", users);
}

sockets.on("connection", socket => {
  const id = socket.id;
  let username = "";

  socket.on("setUsername", name => {
    username = name;
    userFunctions.add({ id, username });

    console.log(`User w/ id: ${id} as ${username} CONNECTED`);
    socket.emit("messages-render", messages);
  });

  socket.on("message-emit", message => {
    const obj = { id, username, message };
    pushMessage(obj);

    sockets.emit("message-render", obj);
  });

  socket.on("disconnect", () => {
    userFunctions.remove({ id });

    console.log(`User w/ id : ${id} DISCONNECTED`);
  });
});

server.listen("3333", () => {
  console.log("Server running!");
});
