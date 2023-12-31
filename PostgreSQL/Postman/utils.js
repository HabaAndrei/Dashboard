import crypto from "crypto";

const debug = {
  log: (...text) => {
    debug.mode && console.log(...text);
  },
  mode: true,
};
function isValidDate(data) {
  const dataParsata = Date.parse(data);
  if (!isNaN(dataParsata)) {
    return true;
  } else {
    return false;
  }
}
function criptezParola(parola) {
  const hash = crypto.createHash("sha256");
  hash.update(parola);
  return hash.digest("hex");
}

function verificamSymbolUpperCase(string) {
  for (let i = 0; i < string.length; i++) {
    if (string[i] !== string[i].toUpperCase()) return false;
  }
  return true;
}
//debug.log(verificamSymbolUpperCase("OOO"));
function verificamSymbolNumar(string) {
  for (let i = 0; i < string.length; i++) {
    if (!isNaN(string[i])) return false;
  }
  return true;
}

function verificamIdentitatea(email, parola, client) {
  return new Promise((resolve, reject) => {
    let parolaCriptata = criptezParola(parola);
    //debug.log(parolaCriptata);
    const values = [email, parolaCriptata];
    const query =
      "SELECT 1 FROM useri WHERE email = $1 and parola = $2 limit 1";
    client.query(query, values, (err, data) => {
      if (err) {
        debug.log(err);
        reject(err);
      } else {
        //debug.log(data.rows);
        if (!data.rows[0]) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  });
}

export {
  isValidDate,
  debug,
  criptezParola,
  verificamSymbolNumar,
  verificamSymbolUpperCase,
  verificamIdentitatea,
};
