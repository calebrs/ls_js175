const HTTP = require('http');
const PORT = 3000;
const URL = require('url').URL;

function dieRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function diceRoll(sides, num) {
  let result = '';

  for (let count = 1; count <= num; count += 1) {
    result += `${dieRoll(1, sides)}\n`;
  }

  return result;
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;
  const myURL = new URL(path, `http://localhost:${PORT}`);
  let params = myURL.searchParams;
  let sides = params.get('sides');
  let dice = params.get('dice');

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`${diceRoll(sides, dice)}\n`);
    res.write(`${method} ${path}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});