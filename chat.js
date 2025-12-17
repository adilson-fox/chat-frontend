const socket = io(); // Conecta automaticamente ao domínio do Railway

const messageForm = document.getElementById('message-form');
const messagesDisplay = document.getElementById('messages-display');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');

// 1. Escutar mensagens que chegam do servidor
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Formatação da mensagem na tela
    messageElement.innerHTML = `
        <span class="user"><strong>${data.user}:</strong></span>
        <span class="text">${data.text}</span>
        <small class="time">${data.time}</small>
    `;
    
    messagesDisplay.appendChild(messageElement);
    
    // Auto-scroll para a última mensagem
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
});

// 2. Enviar mensagem ao submeter o formulário
messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const messageData = {
        user: usernameInput.value,
        text: messageInput.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Envia para o servidor (Railway -> Supabase)
    socket.emit('message', messageData);

    // Limpa apenas o campo da mensagem
    messageInput.value = '';
    messageInput.focus();
});
