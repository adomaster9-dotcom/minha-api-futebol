const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/jogos', async (req, res) => {
    try {
        // Buscamos direto da API de placares do UOL (Muito mais estável)
        const url = 'https://uol-placar.uol.com.br/6/futebol/hoje.json';
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = response.data;
        const jogos = [];

        // O UOL organiza os dados em um formato fácil de ler
        if (data && data.partidas) {
            Object.values(data.partidas).forEach(partida => {
                jogos.push({
                    liga: partida.campeonato?.nome || "Geral",
                    homeTeam: partida.time1?.nome_comum || "Time A",
                    awayTeam: partida.time2?.nome_comum || "Time B",
                    score: `${partida.placar1 ?? 0} - ${partida.placar2 ?? 0}`,
                    status: partida.fase || partida.horario || "Agendado"
                });
            });
        }

        res.json(jogos);
    } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
        res.status(500).json({ error: "Erro ao carregar placares do servidor" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`API Ativa na porta ${PORT}`));
