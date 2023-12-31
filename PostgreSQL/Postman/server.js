import express from "express";
import cors from "cors";
import { debug } from "./utils.js";

////////////////--------- SERVER CONECTION ---------\\\\\\\\\\\\\\\\\\

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  debug.log("Listening on port" + " " + PORT);
});

export default app;
