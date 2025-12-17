// --- CONFIGURAÇÃO BLINDADA DO SUPABASE ---

// Função para remover aspas e espaços extras que o Railway pode injetar
const limparVariavel = (valor) => {
  if (!valor) return null;
  return valor.replace(/['"]+/g, '').trim();
};

const supabaseUrl = limparVariavel(process.env.SUPABASE_URL);
const supabaseKey = limparVariavel(process.env.SUPABASE_KEY);

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ ALERTA: Variáveis não encontradas no process.env");
  // Log para debug (não mostre sua chave inteira por segurança)
  console.log("DEBUG -> URL encontrada:", supabaseUrl ? "SIM" : "NÃO");
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Cliente Supabase configurado com sucesso!");
    console.log("🔗 Conectado em:", supabaseUrl);
  } catch (err) {
    console.error("❌ Erro fatal ao inicializar Supabase:", err.message);
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
