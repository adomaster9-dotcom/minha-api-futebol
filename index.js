const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/jogos', async (req, res) => {
    try {
        // Mudamos para uma URL que raramente muda a estrutura
        const { data } = await axios.get('https://www.placardefutebol.com.br/', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
        });
        
        const $ = cheerio.load(data);
        const jogos = [];

        // Buscamos todos os blocos que contenham times (independente da classe exata)
        $('.match-content').each((_, el) => {
            const home = $(el).find('.team-name').first().text().trim();
            const away = $(el).find('.team-name').last().text().trim();
            const score = $(el).find('.match-score').text().trim().replace(/\s+/g, '');
            const status = $(el).find('.status-name').text().trim() || "Agendado";
            const liga = $(el).closest('.row').prev('h3').text().trim() || "Geral";

            if (home && away) {
                jogos.push({
                    liga: liga,
                    homeTeam: home,
                    awayTeam: away,
                    score: score || "vs",
                    status: status
                });
            }
        });

        // Se por algum motivo a lista ainda estiver vazia, enviamos um log interno
        if (jogos.length === 0) {
            console.log("Atenção: A raspagem não encontrou elementos com .match-content");
        }

        res.json(jogos);
    } catch (error) {
        res.status(500).json({ error: "Erro na conexão com a fonte" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`API Ativa na porta ${PORT}`));
        
