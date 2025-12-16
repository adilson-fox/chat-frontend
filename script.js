const socket = io();
const messagesContainer = document.getElementById('messages');
const sendButton = document.getElementById('sendButton');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

// Enviar mensagem
sendButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (username && message) {
        socket.emit('send_message', { username, message });
        messageInput.value = ''; // Limpar campo de mensagem
    }
});

// Receber mensagem do servidor
socket.on('receive_message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Rolar para a última mensagem
});
