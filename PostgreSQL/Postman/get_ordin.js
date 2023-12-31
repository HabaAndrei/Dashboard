import { debug } from "./utils.js";

function getOrdin(req, res, client) {
  const email = req.body[0].email;
  const { id } = req.query;
  //console.log(id, email);
  if (isNaN(Number(id))) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at id";
    return res.send();
  }

  client.query(
    `
    select id, symbol, price, type, ordin, nr_stocks, expiration_date, start_data, status, email from ordine
    where ordine.id = ${id} and ordine.email = '${email}'
  `,
    (err, data) => {
      if (err) {
        debug.log(err);
        res.statusCode = 500;
        res.send();
      } else {
        //debug.log(data);
        if (data.rowCount === 0) {
          res.statusCode = 400;
          res.statusMessage = "That id doesnt exist ";
          res.send();
        } else {
          res.statusCode = 200;
          res.json(data.rows);
        }
      }
    }
  );
}

export default getOrdin;
