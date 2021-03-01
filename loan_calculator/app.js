const HTTP = require('http');
const PORT = 3000;
const URL = require('url').URL;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 2rem;
      }

      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

function getParams(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  return myURL.searchParams;
}

function getMonthlyPayment(duration, amount) {
  let monthlyInterestRate = .00416;
  let months = duration * 12;
  return monthlyPayment = amount * 
                       (monthlyInterestRate / 
                       (1 - Math.pow((1 + monthlyInterestRate),(-months))));
}

function calulateLoan(params) {
  let result = '';
  let amount = Number(params.get('amount'));
  let duration = Number(params.get('duration'));
  let monthlyPayment = getMonthlyPayment(duration, amount);
  
  result = `<tr>
               <th>Amount</th>
               <td><a href='/?amount=${amount - 100}&duration=${duration}'>- $100</a></td>
               <td>$${amount}</td>
               <td><a href='/?amount=${amount + 100}&duration=${duration}'>+ $100</a></td>
             </tr>

             <tr>
              <th>Duration</th>
              <td><a href='/?amount=${amount}&duration=${duration - 1}'>- 1 year</a></td>
              <td>${duration} years</td>
              <td><a href='/?amount=${amount}&duration=${duration + 1}'>+ 1 year</a></td>
             </tr>

             <tr>
               <th>APR</th>
               <td colspan='3'>5%</td>
             </tr>

             <tr>
               <th>Monthly Payment</th>
               <td colspan='3'>$${monthlyPayment.toFixed(2)}</td>
             </tr>`

  return HTML_START + result + HTML_END;
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    let content = calulateLoan(getParams(path));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(content);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});