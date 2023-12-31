const axios = require("axios");
const { Client } = require("pg");
const fs = require("fs");
require('dotenv').config();

//////////////////////////////
/*
const {HOST, USER, PORT, PASSWORD, DATABASE, PRET} = process.env;
const client = new Client({
  host:HOST, user:USER, port:PORT, password:PASSWORD, database:DATABASE
});
*/
const client = new Client ({
        user: 'postgres',
        password: '1707',
        host: 'localhost',
        port: 5432,
        database: 'template1',
});

client.connect();
//////////////////////////////
const paginaSymboluri = "./tot.txt";

(function luamPreturi(paginaSymboluri) {
  fs.readFile(paginaSymboluri, "utf-8", (err, data) => {
    if (err) {
      console.log('eroare la citire de pagina');
    } else {
      let tickers = data.split("\n");

      const intervalId = setInterval(() => {
        if (tickers.length === 0) {
          console.log('facem o rocads !!');
          clearInterval(intervalId);  // Clear the interval when there are no more symbols
          luamPreturi(paginaSymboluri);
          // process.exit();
        }

        let simbol = tickers.shift();
        axios
          .get(
            `https://api.polygon.io/v2/aggs/ticker/${simbol}/prev?adjusted=true&apiKey=pi__uk7fS3e6_tDkL5gd2ArriDsGWIGm`
          )
          .then((data) => {
            try {
              let symbol = data.data.ticker;
              console.log(symbol, 'am primit pret')
              let ob = data.data.results[0];
              let price = ob.c;
              let highest = ob.h;
              let lowest = ob.l;
              let open = ob.o;
              //let time = new Date(ob.t).toLocaleDateString("ro-RO");
	      let time = new Date(ob.t).toISOString().split('T')[0];
              const query =
                "insert into preturi (symbol, price, highest, lowest, open, data) values($1, $2, $3, $4, $5, $6)";
              const values = [symbol, price, highest, lowest, open, time];

              client.query(query, values, (err, data) => {
                if (err) {
                  console.log("ceva nu e ok la query, insert");
                } else {
                  console.log("totul a mers ok la query, insert");
                }
              });
            } catch (err) {
              console.log("eroare la fetch data[0]   s:", simbol);
            }
          })
          .catch((err) => {
            console.log("eroare la fetch");
            // luamPreturi();
          });
      }, 14 * 1000);
    }
  });
})(paginaSymboluri);

function schimbamStatus() {
  client.query(
    `
  update ordine set status  = 'e' where expiration_date < current_timestamp
  `,
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    }
  );
}
schimbamStatus();
