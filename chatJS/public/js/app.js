const socket = io();

let user_id;
let username;

function setUsername() {
  username = prompt("Como se chama?");

  !username ? setUsername() : null;
}

setUsername();

console.log(username);

socket.on("connect", () => {
  user_id = socket.id;

  socket.emit("setUsername", username);
});

function emitMessage(message) {
  socket.emit("message-emit", message);
}

function renderMessage(message) {
  $(".chat-display").prepend(`
    <div class='d-flex justify-content-${
      user_id === message.id ? "end" : "start"
    } mb-4'>
      <div class='circle' style='display: none'><div class='initials'>L</div></div>  
      <div class='${
        user_id === message.id ? "message-container-send" : "message-container"
      }'>
        <div class='msg'>${message.message}</div>
      </div>
      <span class='msg-user'>${message.username}</span>
    </div>
  `);
}

function renderUsers(users) {
  $(".users-display").empty();

  for (const user of users) {
    $(".users-display").append(`
      <div class='user ${
        user.id === user_id ? "current-user" : ""
      } container-sm'>
        ${user.username}
      </div>
    `);
  }
}

$("form").submit(e => {
  e.preventDefault();

  const message = $("#message-input").val();

  emitMessage(message);

  $("#message-input").val("");
});

socket.on("messages-render", messages => {
  messages = messages.reverse();
  for (const message of messages) {
    renderMessage(message);
  }
});

socket.on("message-render", message => {
  renderMessage(message);
});

socket.on("users-render", users => {
  renderUsers(users);
});
