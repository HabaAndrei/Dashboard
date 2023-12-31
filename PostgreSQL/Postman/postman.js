import connectDB from "./db.js";

import initRoutes from "./apiRoutes.js";

///////////////-------- INIT DIVERSE --------------\\\\\\\\\\\\\

connectDB().then((client) => {
  initRoutes(client);
});

/*
[{
    "email": "tu@gmail.com",
    "password": "tu@gmail.com",
    "symbol" : "A",
    "price": "120",
    "type": "buy",
    "ordin" : "market", 
    "nrStocks" : "11", 
    "expirationData": "2023-08-01"
}]
*/
