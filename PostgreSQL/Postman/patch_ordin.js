import {
  isValidDate,
  debug,
  verificamSymbolNumar,
  verificamSymbolUpperCase,
  verificamIdentitatea,
} from "./utils.js";

function patchOrdine(req, res, client) {
  const { id } = req.params;
  let {
    email,
    password,
    symbol,
    price,
    type,
    ordin,
    nrStocks,
    expirationData,
  } = req.body[0];

  if (!(symbol || price || type || ordin || nrStocks || expirationData)) {
    res.statusCode = 400;
    res.statusMessage = "You need to put the values you want to change.";
    return res.send();
  }
  ///////////////////////////////

  if (symbol && !verificamSymbolNumar(symbol)) {
    res.statusCode = 400;
    res.statusMessage = "We don t have that symbol";
    return res.send();
  }
  if (expirationData && !isValidDate(expirationData)) {
    res.statusCode = 400;
    res.statusMessage = `The expiration date it s not a valid data`;
    return res.send();
  }
  if (symbol && symbol.length > 6) {
    res.statusCode = 400;
    res.statusMessage = "We don t have that symbol";
    res.send();
  }
  if (symbol && !verificamSymbolUpperCase(symbol)) {
    res.statusCode = 400;
    res.statusMessage =
      "We don't have that symbol. The symbol should be uppercase";
    return res.send();
  }
  if (price && isNaN(price)) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at price";
    return res.send();
  }
  if (price && price > 100000) {
    res.statusCode = 400;
    res.statusMessage = "You need to set a lower price";
    return res.send();
  }
  if (type && type !== "buy" && type !== "sell") {
    res.statusCode = 400;
    res.statusMessage = "You have to put buy or sell";
    return res.send();
  }
  if (ordin && ordin !== "market" && ordin !== "limit") {
    res.statusCode = 400;
    res.statusMessage = "We don t have this ordin";
    return res.send();
  }
  if (nrStocks && isNaN(Number(nrStocks))) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at nrStocks";
    return res.send();
  }
  if (nrStocks && nrStocks > 500) {
    res.statusCode = 400;
    res.statusMessage = "The number of stocks it s to biger";
    return res.send();
  }
  if (isNaN(Number(id))) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at id";
    return res.send();
  }
  if (expirationData && Date.parse(expirationData) <= Date.now()) {
    res.statusCode = 400;
    res.statusMessage = "You should set a larger expiration date";
    return res.send();
  }
  if (ordin === "market" && price) {
    res.statusCode = 400;
    res.statusMessage = "Cannot place market order with target price";
    return res.send();
  }
  if (ordin === "limit" && !price) {
    res.statusCode = 400;
    res.statusMessage = "Cannot place limit order without price";
    return res.send();
  }

  ////////////////////////////////////
  const obFaraEmailSiParola = req.body[0];
  delete obFaraEmailSiParola.email;
  delete obFaraEmailSiParola.password;

  let arrayKeys = [];
  let arrayProp = [];

  for (let i in obFaraEmailSiParola) {
    if (["symbol", "price", "type", "ordin"].includes(i)) {
      arrayKeys.push(i);
    } else if (i === "nrStocks") {
      arrayKeys.push("nr_stocks");
    } else if (i === "expirationData") {
      arrayKeys.push("expiration_date");
    }
  }
  for (let i in obFaraEmailSiParola) {
    arrayProp.push(obFaraEmailSiParola[i]);
  }

  if (ordin === "market") {
    arrayKeys.push("price");
    arrayProp.push(null);
  }

  let sintaxa = arrayKeys
    .map((cheie, index) => `${cheie} = $${index + 1}`)
    .join(", ");
  const query = `
      
              update ordine set ${sintaxa} from preturi 
              where preturi.symbol = '${symbol}' and ordine.email = '${email}' and ordine.id = ${id} and status = 'i' 
              `;

  client.query(
    `select 1 from preturi where symbol = '${symbol}' limit 1`,
    (err, data) => {
      if (err) {
        debug.log(err);
        res.statusCode = 500;
        res.send();
      } else {
        if (data.rows.length) {
          client.query(query, arrayProp, (err, data) => {
            if (err) {
              debug.log(err);
              res.statusCode = 500;
              res.send();
            } else {
              if (data.rowCount === 0) {
                res.statusCode = 400;
                res.statusMessage = "That id doesnt exists";
                res.send();
              } else {
                res.status = 200;
                res.statusMessage = "OK";
                res.send();
              }
            }
          });
        } else {
          res.statusCode = 400;
          res.statusMessage = "That symbol doesnt exists";
          res.send();
        }
      }
    }
  );
}

export default patchOrdine;
