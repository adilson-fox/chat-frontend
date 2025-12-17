// Conexão com backend hospedado no Render
//const socket = io('https://adilson-fox.onrender.com');

//const socket = io('https://adilson-fox.onrender.com');
const socket = io('http://localhost:3000');



// Função para exibir mensagens
const displayMessage = (username, message) => {
    const messagesDisplay = document.getElementById('messages-display');
    const newMessage = document.createElement('div');
    newMessage.textContent = `${username}: ${message}`;
    messagesDisplay.appendChild(newMessage);
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight; // auto-scroll
};

// Receber mensagens do servidor
socket.on('new_message', (data) => {
    const { username, content } = data;
    displayMessage(username, content);
});

// Enviar mensagem
const messageForm = document.getElementById('message-form');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username-input').value;
    const content = document.getElementById('message-input').value;
    
    if (username.trim() && content.trim()) {
        socket.emit('send_message', { username, content });
        document.getElementById('message-input').value = '';
    }
});
