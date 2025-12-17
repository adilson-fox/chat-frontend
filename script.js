const socket = io(); // Conecta ao Railway automaticamente
const messagesContainer = document.getElementById('messages');
const sendButton = document.getElementById('sendButton');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

// Enviar mensagem
sendButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (username && message) {
        // Mudamos de 'send_message' para 'message' para bater com o server.js
        socket.emit('message', { 
            user: username, // O servidor espera 'user'
            text: message,  // O servidor espera 'text'
            time: new Date().toLocaleTimeString() 
        });
        messageInput.value = ''; 
    }
});

// Receber mensagem do servidor
// Mudamos de 'receive_message' para 'message'
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    // Usamos data.user e data.text conforme definido no servidor
    messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; 
});
