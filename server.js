const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configuração do Supabase (Railway injeta as variáveis)

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "OK" : "NÃO ENCONTRADA");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.send('Servidor rodando com Supabase + Socket.io 🚀');
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Receber mensagem do cliente
  socket.on('mensagem', async ({ username, content }) => {
    const conversation_id = uuidv4(); // gera um UUID único

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id,
          username,
          content,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
    } else {
      console.log('Mensagem salva:', data);
      // opcional: enviar de volta para todos os clientes conectados
      io.emit('mensagem', { username, content });
    }
  });

  // Recuperar mensagens antigas
  socket.on('listarMensagens', async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
    } else {
      socket.emit('historico', data);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
