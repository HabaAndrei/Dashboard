import { isValidDate, debug, verificamIdentitatea } from "./utils.js";

function getOrdine(req, res, client) {
  ///////////////////////////////////////

  const { email, password } = req.body[0];
  let {
    fields,
    offset,
    count,
    order,
    status,
    ordin,
    type,
    minExpirationData,
    maxExpirationData,
    minStartData,
    maxStartData,
  } = req.query;

  const valoriDeAratat = fields?.split(",");

  // verific daca fields contine coloane interzise
  const valoriPermise = [
    "id",
    "symbol",
    "price",
    "type",
    "ordin",
    "nrStocks",
    "expirationData",
    "startData",
    "status",
    "email",
  ];
  const valoriInterzise = valoriDeAratat?.filter(
    (x) => !valoriPermise?.includes(x)
  );
  if (valoriInterzise?.length) {
    res.statusCode = 400;
    if (valoriInterzise.length === 1) {
      res.statusMessage = `We don t have that field: ${valoriInterzise[0]} `;
    } else {
      res.statusMessage = `We don t have that fields: ${valoriInterzise.join(
        ", "
      )} `;
    }
    return res.send();
  }

  // pentru fiecare field adauga coloane specifica din postgres
  const coloane = [];
  valoriDeAratat?.forEach((x) => {
    if (
      ["id", "symbol", "price", "type", "ordine", "status", "email"].includes(x)
    ) {
      coloane.push(x);
    }
    if (x === "nrStocks") {
      coloane.push("nr_stocks");
    }
    if (x === "expirationData") {
      coloane.push("expiration_date");
    }
    if (x === "startData") {
      coloane.push("start_data");
    }
  });

  // verificari suplimentare
  if (type && !["buy", "sell"].includes(type)) {
    res.statusCode = 400;
    res.statusMessage = 'The type should be "sell" or "buy" ';
    return res.send();
  }

  if (!["limit", "market", undefined].includes(ordin)) {
    res.statusCode = 400;
    res.statusMessage = 'The ordin should be "limit" or "market" ';
    return res.send();
  }

  if (count && isNaN(Number(count))) {
    res.statusCode = 400;
    res.statusMessage = "The count have to be a number";
    return res.send();
  }
  if (count && count < 0) {
    res.statusCode = 400;
    res.statusMessage = "The count have to be a positive number";
    return res.send();
  }
  if (offset && isNaN(Number(offset))) {
    res.statusCode = 400;
    res.statusMessage = "The offset have to be a number";
    return res.send();
  }
  if (status && !["i", "e", "d", "s"].includes(status)) {
    res.statusCode = 400;
    res.statusMessage = "The status should be 'i', 'e', 's' or 'd' ";
    return res.send();
  }
  // verificam daca datele sunt valide
  let dateInvalide = [];
  [minExpirationData, maxExpirationData, minStartData, maxStartData].forEach(
    (data) => {
      if (data && !isValidDate(data)) {
        dateInvalide.push(data);
      }
    }
  );
  if (dateInvalide.length) {
    res.statusCode = 400;
    if (dateInvalide.length === 1) {
      res.statusMessage = `Invalid date is: ${dateInvalide[0]}`;
    } else {
      res.statusMessage = `Invalid dates are: ${dateInvalide.join(", ")}`;
    }
    return res.send();
  }
  ///////////////////////////////////////////////
  if (
    order &&
    ![
      "id",
      "nrStocks",
      "expirationData",
      "startData",
      "price",
      "symbol",
    ].includes(order?.split(",")[0])
  ) {
    // verificare order
    res.statusCode = 400;
    res.statusMessage = `We cant order by ${order?.split(",")[0]}`;
    return res.send();
  }
  let coloanaDeOrdonare = "";

  const arr0 = order?.split(",")[0];
  if (order && arr0 === "nrStocks") coloanaDeOrdonare = "nr_stocks";
  if (order && arr0 === "expirationData") coloanaDeOrdonare = "expiration_date";
  if (order && arr0 === "startData") coloanaDeOrdonare = "start_data";
  if (order && ["id", "price", "symbol"].includes(arr0)) {
    coloanaDeOrdonare = arr0;
  }

  let directieOrder = "asc";
  if (order && !["desc", "asc", undefined].includes(order?.split(",")[1])) {
    res.statusCode = 400;
    res.statusMessage = `We cant order the values by ${order.split(",")[1]} `;
    return res.send();
  }
  if (order && order.split(",")[1] === "desc") directieOrder = "desc";

  // creez query-ul
  const valoriDeAratatQuery = coloane?.join(", ");
  const unu = fields
    ? `select ${valoriDeAratatQuery} from ordine`
    : "select id, symbol, price, type, ordin, nr_stocks, expiration_date, start_data, status, email from ordine";

  const doi = status ? `and status = '${status}'` : "";
  const doiPunctUnu = ordin ? `and ordin = '${ordin}' ` : "";
  const doiPunctDoi = type ? `and type = '${type}'` : "";
  const doiPunctTrei = minExpirationData
    ? `and expiration_date >= '${minExpirationData}'`
    : "";
  const doiPunctPatru = maxExpirationData
    ? `and expiration_date <= '${maxExpirationData}' `
    : "";
  const doiPunctCinci = minStartData
    ? `and start_data >= '${minStartData}'`
    : "";
  const doiPunctSase = maxStartData
    ? `and start_data <= '${maxStartData}'`
    : "";

  //const orderParam = order?.split(",").join(" ");
  const trei = order ? `order by ${coloanaDeOrdonare} ${directieOrder}` : "";

  const patru = count ? `limit ${count}` : "limit 10";

  const cinci = offset ? `offset ${offset}` : "";

  const query =
    unu +
    " " +
    `where email = '${email}'` +
    " " +
    doi +
    " " +
    doiPunctUnu +
    " " +
    doiPunctDoi +
    " " +
    doiPunctTrei +
    " " +
    doiPunctPatru +
    " " +
    doiPunctCinci +
    " " +
    doiPunctSase +
    " " +
    trei +
    " " +
    patru +
    " " +
    cinci;

  //debug.log(query);

  //debug.log(query);
  client.query(query, (err, data) => {
    if (err) {
      debug.log(err, "eroare la query ordine");
      res.statusCode = 500;
      res.send();
    } else {
      //debug.log(data.rows);
      res.statusCode = 200;
      res.statusMessage = "OK";
      res.json(data.rows);
    }
  });
}

export default getOrdine;
