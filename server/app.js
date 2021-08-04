// importação de dependência(s)
import express from 'express';
import { readFile } from 'fs'

// variáveis globais deste módulo
const PORT = 3000;
const db = {};
const app = express();


// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
readFile('server/data/jogadores.json', (err, data) => {
  if(err) throw err;
  
  db.players = JSON.parse(data.toString()).players;
})

readFile('server/data/jogosPorJogador.json', (err, data) => {
  if(err) throw err;
  
  db.gamesPerPlayer = JSON.parse(data.toString());
})



// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');
app.set('views', 'server/views');

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
app.get('/', (req, res) => {
  res.render('index', { players: db.players})
})


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
app.get('/jogador/:id', (req, res) => {
  const { id } = req.params;

  const player = db.players.find(player => player.steamid === id);
  if(!player) res.status(404).send();

  const fullPlayer = {...player};

  const playerGamesInfo = db.gamesPerPlayer[id];
  const playerGames = [...playerGamesInfo.games];

  fullPlayer.top5 = playerGames
    .sort((a,b) => b.playtime_forever - a.playtime_forever)
    .slice(0,5);

  fullPlayer.gamesCount = playerGamesInfo.game_count;
  fullPlayer.gamesNotPlayedCount = playerGames.filter(game => game.playtime_forever === 0).length
  fullPlayer.top5 = fullPlayer.top5.map(game => ({
    ...game,
    playtime_forever_hours: Math.floor(game.playtime_forever/60)
  }))

  res.render('jogador', fullPlayer)
})

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
app.use(express.static('client'));


// abrir servidor na porta 3000 (constante PORT)
app.listen(PORT, () => {
  console.log("Servidor iniciado na porta " + PORT);
})
