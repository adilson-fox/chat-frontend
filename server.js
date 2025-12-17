// Log de diagnóstico
console.log("--- DIAGNÓSTICO DE AMBIENTE ---");
console.log("Variáveis disponíveis:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));

const supabaseUrl = process.env.SUPABASE_URL?.replace(/['"]+/g, '').trim();
const supabaseKey = process.env.SUPABASE_KEY?.replace(/['"]+/g, '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ ALERTA: SUPABASE_URL ou SUPABASE_KEY não encontradas no process.env");
} else {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Cliente Supabase configurado com sucesso.");
  } catch (e) {
    console.error("Erro ao criar cliente:", e.message);
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
