const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/jogos', async (req, res) => {
    try {
        // Headers para simular um navegador real e evitar bloqueios
        const { data } = await axios.get('https://ge.globo.com/central-de-jogos/', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000 // 10 segundos de limite
        });
        
        const $ = cheerio.load(data);
        const jogos = [];

        $('.lista-jogos-grupo').each((_, grupo) => {
            const liga = $(grupo).find('.lista-jogos-titulo').text().trim();

            $(grupo).find('.lista-jogos-item').each((_, el) => {
                const home = $(el).find('.jogo-equipe-mandante .jogo-equipe-nome-completo').text().trim() || 
                             $(el).find('.jogo-equipe-mandante .jogo-equipe-nome').text().trim();
                
                const away = $(el).find('.jogo-equipe-visitante .jogo-equipe-nome-completo').text().trim() || 
                             $(el).find('.jogo-equipe-visitante .jogo-equipe-nome').text().trim();

                const placarHome = $(el).find('.jogo-placar-placar-mandante').text().trim();
                const placarAway = $(el).find('.jogo-placar-placar-visitante').text().trim();
                
                let status = $(el).find('.jogo-placar-informacoes-tempo').text().trim() || 
                             $(el).find('.jogo-placar-informacoes-horario').text().trim();

                if (home && away) {
                    jogos.push({
                        liga: liga || "Outros",
                        homeTeam: home,
                        awayTeam: away,
                        score: placarHome !== "" ? `${placarHome} - ${placarAway}` : "vs",
                        status: status || "A confirmar"
                    });
                }
            });
        });

        res.json(jogos);
    } catch (error) {
        console.error("Erro na raspagem:", error.message);
        res.status(500).json({ error: "Erro ao coletar dados", detalhes: error.message });
    }
});

// AJUSTE DE PORTA PARA O RENDER
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
