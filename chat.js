// Conectar ao servidor Railway
const socket = io("https://chat-frontend-production-e496.up.railway.app/"); // troque pela URL do seu deploy

const messagesDisplay = document.getElementById("messages-display");
const messageForm = document.getElementById("message-form");
const usernameInput = document.getElementById("username-input");
const messageInput = document.getElementById("message-input");

// Exibir mensagens no chat
function addMessage(username, content) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.textContent = `${username}: ${content}`;
  messagesDisplay.appendChild(div);
  messagesDisplay.scrollTop = messagesDisplay.scrollHeight; // rolar para o fim
}

// Receber mensagens em tempo real
socket.on("mensagem", (msg) => {
  addMessage(msg.username, msg.content);
});

// Receber histórico ao conectar
socket.on("historico", (mensagens) => {
  messagesDisplay.innerHTML = "";
  mensagens.forEach(m => addMessage(m.username, m.content));
});

// Pedir histórico ao conectar
socket.on("connect", () => {
  socket.emit("listarMensagens");
});

// Enviar mensagem
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const content = messageInput.value.trim();

  if (username && content) {
    socket.emit("mensagem", { username, content });
    messageInput.value = "";
  }
});
