import {
  isValidDate,
  debug,
  verificamSymbolNumar,
  verificamSymbolUpperCase,
  verificamIdentitatea,
} from "./utils.js";

function postOrdine(req, res, client) {
  //console.log(client.query, "-----------------------------------------");
  const REQUIRED_POST_FIELDS = [
    "symbol",
    "type",
    "ordin",
    "nrStocks",
    "expirationData",
  ];

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

  // filtrez cheile care lipsesc din required
  const elemLipsesc = REQUIRED_POST_FIELDS.filter(
    (i) => !Object.keys(req.body[0]).includes(i)
  );

  if (ordin === "market" && price) {
    res.statusCode = 400;
    res.statusMessage = "Cannot place market order with target price";
    return res.send();
  }

  if (elemLipsesc.length) {
    res.statusCode = 401;
    if (elemLipsesc.length === 1)
      res.statusMessage = `Missing required key: ${elemLipsesc[0]}`;
    else res.statusMessage = `Missing required keys: ${elemLipsesc.join(", ")}`;
    return res.send();
  }
  if (ordin === "limit" && !price) {
    res.statusCode = 400;
    res.statusMessage = "The price is missing";
    return res.send();
  }

  if (!verificamSymbolNumar(symbol)) {
    res.statusCode = 400;
    res.statusMessage = "We don t have that symbol";
    return res.send();
  }
  if (!verificamSymbolUpperCase(symbol)) {
    res.statusCode = 400;
    res.statusMessage =
      "We don't have that symbol. The symbol should be uppercase ";
    return res.send();
  }
  if (symbol?.length > 6) {
    res.statusCode = 400;
    res.statusMessage = "We don t have that symbol";
    return res.send();
  }
  if (nrStocks > 500) {
    res.statusCode = 400;
    res.statusMessage = "You can't put that much in nrStocks";
    return res.send();
  }
  if (price > 100000) {
    res.statusCode = 400;
    res.statusMessage = "The price it s to large";
    return res.send();
  }
  if (price < 0) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a pisitive number at price";
    return res.send();
  }
  if (price && isNaN(price)) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at price";
    return res.send();
  }
  if (!["buy", "sell"].includes(type)) {
    res.statusCode = 400;
    res.statusMessage = "You have to put buy or sell";
    return res.send();
  }
  if (!["market", "limit"].includes(ordin)) {
    res.statusCode = 400;
    res.statusMessage = "We don t have this ordin";
    return res.send();
  }
  if (isNaN(Number(nrStocks))) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at nrStocks";
    return res.send();
  }
  if (expirationData && !isValidDate(expirationData)) {
    res.statusCode = 400;
    res.statusMessage = `The expiration date it s not a valid data`;
    return res.send();
  }
  if (Date.parse(expirationData) <= Date.now()) {
    res.statusCode = 400;
    res.statusMessage = "You should set a larger expiration date";
    return res.send();
  }

  try {
    (async () => {
      if (ordin === "market") {
        price = null;
      }

      client.query(
        `
          do $$ begin
            if not exists (
            SELECT 1
            FROM preturi where symbol = '${symbol}' limit 1 
            )  then 
            raise notice 'eroare';
          else
            insert into ordine (symbol, price, email, type, ordin, nr_stocks, expiration_date) 
              select '${symbol}', ${price}, '${email}', '${type}', '${ordin}', ${nrStocks}, '${expirationData}'; 
            raise notice 'am inserat in tabel';
            end if;
          end $$;
              select lastval();  
              `,
        (err, data) => {
          if (err) {
            debug.log(err);
            res.statusCode = 400;
            res.statusMessage = "we don t have that symbol";
            res.send();
          } else {
            let id = data[1].rows[0].lastval;
            res.statusMessage = "OK";
            res.json({
              id: `${id}`,
            });
          }
        }
      );
    })();
  } catch (err) {
    debug.log("eroare la try catch post method");
  }
}

export default postOrdine;
