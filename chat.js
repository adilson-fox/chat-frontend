const socket = io(); // Conecta automaticamente ao domínio do Railway

const messageForm = document.getElementById('message-form');
const messagesDisplay = document.getElementById('messages-display');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');

// Função auxiliar para criar o balão de mensagem na tela
function displayMessage(data) {
    const messageElement = document.createElement('div');
    const myName = usernameInput.value.trim();

    // Lógica de Lados: Se o nome for igual ao meu, vai para a direita (sent)
    // Se for diferente, vai para a esquerda (received)
    if (myName !== "" && data.user === myName) {
        messageElement.classList.add('message', 'sent');
    } else {
        messageElement.classList.add('message', 'received');
    }
    
    // Formatação interna do balão
    messageElement.innerHTML = `
        <span class="user">${data.user}</span>
        <span class="text">${data.text}</span>
        <small class="time">${data.time}</small>
    `;
    
    messagesDisplay.appendChild(messageElement);
    
    // Auto-scroll para a última mensagem
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

// 1. Escutar o HISTÓRICO (mensagens antigas do banco)
socket.on('previous_messages', (messages) => {
    // Limpa a tela antes de carregar o histórico (opcional, evita duplicados)
    messagesDisplay.innerHTML = ''; 
    messages.forEach(msg => displayMessage(msg));
});

// 2. Escutar NOVAS mensagens em tempo real
socket.on('message', (data) => {
    displayMessage(data);
});

// 3. Enviar mensagem ao submeter o formulário
messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const messageData = {
        user: usernameInput.value,
        text: messageInput.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Envia para o servidor
    socket.emit('message', messageData);

    // Limpa apenas o campo da mensagem e mantém o foco
    messageInput.value = '';
    messageInput.focus();
});
