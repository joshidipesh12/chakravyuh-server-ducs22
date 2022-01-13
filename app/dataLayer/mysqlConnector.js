import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql';

export class MySQLConnector {
  #isConnected;
  constructor() {}

  createConnection() {
    let status = new Promise((res, rej) => {
      if (!this.#isConnected)
        mysql
          .createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
          })
          .connect(err => {
            if (err) {
              console.log(`[Error Connecting to DB]: ${err.message}`);
              res(false);
            } else {
              console.log(`MYSQL Connection Successful!!`);
              this.#isConnected = true;
              res(true);
            }
          });
    });
    return status;
  }
  // getInstance() {
  //   if (!MySQLConnector.#instance) {
  //     MySQLConnector.#instance = new MySQLConnector();
  //   }
  //   return MySQLConnector.#instance;
  // }
}
