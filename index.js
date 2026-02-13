const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/jogos', async (req, res) => {
    try {
        // Fonte alternativa muito mais estável para raspagem
        const { data } = await axios.get('https://www.placardefutebol.com.br/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(data);
        const jogos = [];

        // No Placar de Futebol, os jogos ficam em containers simples
        $('.container .row').each((_, el) => {
            const liga = $(el).prev('h3').text().trim(); // Pega o nome da liga que vem antes do bloco
            
            $(el).find('.match-card').each((_, card) => {
                const home = $(card).find('.team-name').first().text().trim();
                const away = $(card).find('.team-name').last().text().trim();
                const score = $(card).find('.match-score').text().trim();
                const status = $(card).find('.status-name').text().trim();

                if (home && away) {
                    jogos.push({
                        liga: liga || "Geral",
                        homeTeam: home,
                        awayTeam: away,
                        score: score || "vs",
                        status: status || "Agendado"
                    });
                }
            });
        });

        res.json(jogos);
    } catch (error) {
        res.status(500).json({ error: "Erro na raspagem", details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Rodando na porta ${PORT}`));
