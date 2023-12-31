import pg from "pg";
import config_db from "./config_db.json" assert { type: "json" };

const { Client } = pg;

const client = new Client(config_db);

async function connectDB() {
  try {
    await client.connect();
    console.log("Ne am conectat cu succes la pg");
    return client;
  } catch (err) {
    console.log(err);
  }
}

//conectDB();
export default connectDB;
