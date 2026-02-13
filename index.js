const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/jogos', async (req, res) => {
    try {
        // Usamos um Proxy para evitar que o UOL bloqueie o Render
        const targetUrl = 'https://uol-placar.uol.com.br/6/futebol/hoje.json';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await axios.get(proxyUrl, { timeout: 15000 });
        
        // O AllOrigins encapsula os dados em uma propriedade chamada 'contents'
        const data = JSON.parse(response.data.contents);
        const jogos = [];

        if (data && data.partidas) {
            Object.values(data.partidas).forEach(p => {
                jogos.push({
                    liga: p.campeonato?.nome || "Futebol",
                    homeTeam: p.time1?.nome_comum || "Mandante",
                    awayTeam: p.time2?.nome_comum || "Visitante",
                    score: `${p.placar1 ?? 0} - ${p.placar2 ?? 0}`,
                    status: p.fase || p.horario || "Agendado"
                });
            });
        }

        res.json(jogos);
    } catch (error) {
        console.error("Erro detalhado:", error.message);
        res.status(500).json({ error: "Erro ao carregar dados via Proxy" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`API rodando na porta ${PORT}`));
