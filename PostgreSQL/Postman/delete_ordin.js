import { debug, verificamIdentitatea } from "./utils.js";

function deleteOrdine(req, res, client) {
  const { id } = req.params;
  let { email, password } = req.body[0];

  // elemetele necesare care lipsesc

  if (isNaN(Number(id))) {
    res.statusCode = 400;
    res.statusMessage = "You have to put a number at id";
    return res.send();
  }

  client.query(
    `                        
              update ordine set status = 'd'  where
               ordine.id = ${id} and ordine.email = '${email}'
              `,
    (err, data) => {
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
    }
  );
}

export default deleteOrdine;
