const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express(); // <--- ESSA LINHA PRECISA ESTAR AQUI
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// --- CONFIGURAÇÃO DO SUPABASE COM DIAGNÓSTICO ---
console.log("Checando variáveis no boot...");

// Função para limpar aspas chatas
const clean = (val) => val ? val.replace(/['"]+/g, '').trim() : null;

const sUrl = clean(process.env.SUPABASE_URL);
const sKey = clean(process.env.SUPABASE_KEY);

let supabase = null;

if (!sUrl || !sKey) {
  console.error("❌ ERRO CRÍTICO: Variáveis não injetadas pelo Railway!");
  console.log("Nomes de variáveis detectados:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
} else {
  try {
    supabase = createClient(sUrl, sKey);
    console.log("✅ Conectado ao Supabase:", sUrl);
  } catch (err) {
    console.error("❌ Erro ao iniciar cliente Supabase:", err.message);
  }
}

app.get('/', (req, res) => {
  res.send('Servidor Ativo 🚀 Status Supabase: ' + (supabase ? 'Conectado' : 'Desconectado'));
});

// O restante do seu código (io.on('connection')...) continua igual abaixo...

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
