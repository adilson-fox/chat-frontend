const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

// 🔐 Inicializando o Supabase
const SUPABASE_URL = "https://vepnalrpyaxhpklicqrb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // sua chave anon

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🚀 Inicializando o servidor Express
const app = express();
const server = http.createServer(app);

// 🔌 Socket.IO com CORS liberado
const io = new Server(server, {
  cors: {
    origin: "*", // ou restrinja para seu domínio Netlify
    methods: ["GET", "POST"]
  }
});

// Conectar ao socket.io e lidar com eventos
io.on('connection', (socket) => {
  console.log('🟢 Novo usuário conectado:', socket.id);

  socket.on('send_message', async (data) => {
    const { username, content } = data;

    // Salvar a mensagem no Supabase
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: 'default', // sala padrão
          username,
          content
        }
      ]);

    if (error) {
      console.error('❌ Erro ao salvar mensagem no Supabase:', error);
      return;
    }

    // Emitir a mensagem para todos os clientes conectados
    io.emit('new_message', { username, content });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuário desconectado:', socket.id);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ouvindo na porta ${PORT}`);
});

// Inicializar o servidor
//const PORT = process.env.PORT || 3000;
//server.listen(PORT, () => {
//  console.log(`🚀 Servidor ouvindo na porta ${PORT}`);
//});
