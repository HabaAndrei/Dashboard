import app from "./server.js";

import ping from "./get_ping.js";
import postOrdine from "./post_ordin.js";
import getOrdin from "./get_ordin.js";
import deleteOrdine from "./delete_ordin.js";
import patchOrdine from "./patch_ordin.js";
import getOrdine from "./get_ordine.js";
//////////////////////////////////
import { verificamIdentitatea } from "./utils.js";
import auth from "./auth.js";
///////////////////////////////
async function initRoutes(client) {
  app.use(auth(client));
  auth(client);
  /////////////////////////////////////////
  app.get("/ping", (req, res) => {
    ping(req, res);
  });

  app.post("/ordin", (req, res) => {
    postOrdine(req, res, client);
  });

  app.get("/ordin", (req, res) => {
    //GET http://localhost:3000/ordin?id=25
    getOrdin(req, res, client);
  });

  app.delete("/ordin/:id", (req, res) => {
    deleteOrdine(req, res, client);
  });

  app.patch("/ordin/:id", (req, res) => {
    patchOrdine(req, res, client);
  });

  app.get("/ordine", (req, res) => {
    // ex url: =>   http://localhost:3000/ordine?fields=nrStocks,expirationData,type&order=id,desc&status=e&count=1&offset=5&ordin=limit&type=sell&minExpirationData=2000-01-09&maxExpirationData=2030-01-01&minStartData=2010-01-01&maxStartData=2030-01-01

    getOrdine(req, res, client);
  });
}

export default initRoutes;
