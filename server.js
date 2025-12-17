const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // libera acesso do frontend
    methods: ['GET', 'POST']
  }
});

// Configuração do Supabase usando variáveis de ambiente da Railway
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.send('Servidor rodando na Railway com Supabase + Socket.io 🚀');
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('mensagem', async (msg) => {
    console.log('Mensagem recebida:', msg);

    // Exemplo: salvar mensagem no Supabase
    const { data, error } = await supabase
      .from('mensagens')
      .insert([{ texto: msg }]);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
    } else {
      console.log('Mensagem salva:', data);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
