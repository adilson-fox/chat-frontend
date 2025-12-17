const socket = io(); 

// Seleção corrigida dos elementos
const messageForm = document.getElementById('chat-form'); // Antes estava 'message-form'
const messagesDisplay = document.getElementById('messages-display');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');

// Elementos para imagem (Anexo)
const clipButton = document.getElementById('clipButton');
const imageInput = document.getElementById('image-input');

// 1. Lógica do botão de Clipe (Abrir seletor de arquivo)
clipButton.addEventListener('click', () => {
    imageInput.click();
});

// 2. Enviar mensagem ao submeter o formulário
messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const user = usernameInput.value.trim();
    const text = messageInput.value.trim();

    if (user === "") {
        alert("Por favor, digite seu nome!");
        return;
    }

    if (text !== "") {
        const messageData = {
            user: user,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Envia para o servidor
        socket.emit('message', messageData);

        // Limpa apenas o campo da mensagem e mantém o foco
        messageInput.value = '';
        messageInput.focus();
    }
});

// 3. Função auxiliar para criar o balão de mensagem na tela
function displayMessage(data) {
    const messageElement = document.createElement('div');
    const myName = usernameInput.value.trim();

    // Lógica de Lados: Comparação para saber se fui eu quem enviou
    if (myName !== "" && data.user === myName) {
        messageElement.classList.add('message', 'sent');
    } else {
        messageElement.classList.add('message', 'received');
    }
    
    // Monta o conteúdo do balão
    messageElement.innerHTML = `
        <span class="user">${data.user}</span>
        <span class="text">${data.text}</span>
        <span class="time">${data.time}</span>
    `;
    
    messagesDisplay.appendChild(messageElement);
    
    // Auto-scroll para a última mensagem
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

// 4. Escutar o HISTÓRICO
socket.on('previous_messages', (messages) => {
    messagesDisplay.innerHTML = ''; 
    messages.forEach(msg => displayMessage(msg));
});

// 5. Escutar NOVAS mensagens
socket.on('message', (data) => {
    displayMessage(data);
});
