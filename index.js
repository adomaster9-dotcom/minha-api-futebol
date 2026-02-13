const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors()); // Libera o acesso para o seu site

app.get('/jogos', async (req, res) => {
    try {
        // Vamos "raspar" os dados de um site que contém os jogos do dia
        const { data } = await axios.get('https://www.placardefutebol.com.br/');
        const $ = cheerio.load(data);
        const jogos = [];

        $('.match-card').each((i, el) => {
            jogos.push({
                liga: $(el).find('.league-name').text().trim(),
                homeTeam: $(el).find('.team-home .team-name').text().trim(),
                awayTeam: $(el).find('.team-away .team-name').text().trim(),
                score: $(el).find('.match-score').text().trim().replace(/\s+/g, ' '),
                status: $(el).find('.match-status').text().trim()
            });
        });

        res.json(jogos);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar jogos" });
    }
});

app.listen(3000, () => console.log('Sua API de Futebol rodando na porta 3000'));
