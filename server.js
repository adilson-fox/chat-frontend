const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// 1. CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS
// Isso faz o Railway entregar seu HTML, CSS e JS do frontend
app.use(express.static(__dirname)); 

// 2. CONFIGURAÇÃO DO SUPABASE
const supabaseUrl = process.env.SUPABASE_URL?.replace(/['"]+/g, '').trim();
const supabaseKey = process.env.SUPABASE_KEY?.replace(/['"]+/g, '').trim();

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("✅ Conexão com Supabase preparada.");
}

// 3. ROTA PRINCIPAL (Abre o seu index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. LÓGICA DO CHAT (SOCKET.IO)
io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on('message', async (data) => {
    // Envia para todos no chat em tempo real
    io.emit('message', data);

    // Salva no Banco de Dados (Supabase)
    if (supabase) {
      const { error } = await supabase
        .from('messages') // Certifique-se que o nome da tabela está correto
        .insert([{ 
          id: uuidv4(), 
          user: data.user, 
          text: data.text, 
          time: data.time 
        }]);
      
      if (error) console.error("Erro ao salvar no banco:", error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// 5. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
