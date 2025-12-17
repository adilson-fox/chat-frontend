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

// --- CONFIGURAÇÃO SEGURA DO SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verifica se as variáveis existem antes de criar o cliente
let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ ALERTA: SUPABASE_URL ou SUPABASE_KEY não encontradas. O deploy continuará, mas a conexão com o banco falhará.");
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Cliente Supabase configurado com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao inicializar cliente Supabase:", err.message);
  }
}

app.get('/', (req, res) => {
  res.send('Servidor rodando com Supabase + Socket.io 🚀');
});

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('mensagem', async ({ username, content }) => {
    // Evita erro se o supabase for null
    if (!supabase) {
      console.error('Erro: Tentativa de salvar mensagem, mas o Supabase não está configurado.');
      return;
    }

    const conversation_id = uuidv4();

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
      console.log('Mensagem salva!');
      io.emit('mensagem', { username, content });
    }
  });

  socket.on('listarMensagens', async () => {
    if (!supabase) return;

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
