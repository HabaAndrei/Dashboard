const axios = require("axios");
const WebSocketServer = require("ws");
const wss = new WebSocketServer.Server({ port: 8000 });
const { Client } = require("pg");
require('dotenv').config();

//////////////////////////////
/*
const {HOST, USER, PORT, PASSWORD, DATABASE, GETSTIRI} = process.env;
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
/////////////////////////////

const clients = [];

wss.on("connection", (conex, r) => {
  clients.push(conex);
  //console.log("S-a conectat un client nou");
});

setInterval(() => {
  axios
    .get(
      `https://api.marketaux.com/v1/news/all?language=en&industries=Energy,Financial,Industrials,Technology,Consumer Cyclical,Consumer Defensive,Real Estate&countries=us,ca&api_token=WjjSGjvYa7DAGjCpcam1tKEP3e1OYwt5FEE4tHH1`
    )
    .then((data) => {
      for (const client of clients) client.send(JSON.stringify(data.data.data));

      const array = data.data.data;

      array.forEach((ob) => {
        let {
          uuid,
          title,
          description,
          url,
          image_url,
          published_at,
          source,
          language,
        } = ob;

        const values = [
          uuid,
          title,
          description,
          url,
          image_url,
          published_at,
          source,
          language,
        ];
        const query = `insert into news  (uuid, title,  description, url, impage_url, published_at, source, language) values ($1, $2, $3, $4, $5, $6, $7, $8)`;

        client.query(query, values, (err, data) => {
          if (err) {
            console.log('stire dublicata in getStiri');
          }
        });
      });
    });
}, 1000 * 60 * 17 );
