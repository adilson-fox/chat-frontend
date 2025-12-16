const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

// 🔐 Supabase (backend usa createClient direto)
const SUPABASE_URL = 'https://vepnalrpyaxhpklicqrb.supabase.co';
const SUPABASE_SERVICE_KEY =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcG5hbHJweWF4aHBrbGljcXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDgxNzIsImV4cCI6MjA3NzQ4NDE3Mn0.-9_J-RE4IWdaGISGZgAXe6S2MLStG9lVm50suQKr7jY';


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY );

// App + Server
const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// (opcional) servir frontend
app.use(express.static('public'));

// Conexão socket
io.on('connection', (socket) => {
  console.log('🟢 Usuário conectado:', socket.id);

  socket.on('send_message', async ({ username, content }) => {
    console.log('📩 Mensagem:', username, content);

    // Salvar no Supabase
    const { error } = await supabase
      .from('messages')
      .insert([ { username, content }
      ]);

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return;
    }

    // Emitir para todos
    io.emit('new_message', {
      username,
      content,
      created_at: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuário desconectado:', socket.id);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});


// Subir servidor
//server.listen(3000, () => {
//  console.log('🚀 Servidor rodando em http://localhost:3000');
//});
