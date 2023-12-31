import { verificamIdentitatea } from "./utils.js";

function auth(client) {
  return (req, res, next) => {
    const REQUIRED_GET_FIELDS = ["email", "password"];
    // verificam ce elemente lipsesc
    const { email, password } = req.body[0];
    const elemLipsesc = REQUIRED_GET_FIELDS.filter(
      (x) => !Object.keys(req.body[0]).includes(x)
    );

    if (elemLipsesc.length) {
      res.statusCode = 401;
      if (elemLipsesc.length === 1)
        res.statusMessage = `Missing required key: ${elemLipsesc}`;
      else
        res.statusMessage = `Missing required keys: ${elemLipsesc.join(", ")}`;
      return res.send();
    }

    verificamIdentitatea(email, password, client).then((isAuthorized) => {
      if (!isAuthorized) {
        res.statusCode = 401;
        return res.send();
      }
      next();
    });
  };
}
export default auth;
