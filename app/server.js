import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
const __dirname = path.resolve();

import config from 'config';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import listEndpoints from 'express-list-endpoints';
const serverConfig = config.get('server');

import {HTTPCODES} from './helpers/index.js';
import {InitRoutersV1} from './v1/InitRoutersV1.js';
import {JWTValidator} from './middlewares/JWTValidator.js';
import {MySQLConnector} from './dataLayer/mysqlConnector.js';

export class AppServer {
  static server; // public for mocha
  #port;
  #dbInstance;
  #jWTValidator;
  #initRoutersV1;
  #allowedOrigins;

  constructor() {
    this.#allowedOrigins = serverConfig.allowedOrigins;
    this.#port = serverConfig.port ?? 8081;
    this.#jWTValidator = new JWTValidator();
    this.#dbInstance = new MySQLConnector();
    this.server = express();
    this.#initRoutersV1 = new InitRoutersV1();
    this.init();
  }

  init() {
    this.#setupApp();
    this.server.use('/api/v1', this.#initRoutersV1.rest);
    this.set;
    this.#start();
  }

  // installing middleware
  #setupApp() {
    this.#allowCrosAccess();
    this.server.use(bodyParser.json());
    this.server.use(cookieParser());
    this.server.use(bodyParser.urlencoded({extended: true}));
    this.server.use(bodyParser.json({limit: serverConfig.headerSize}));
    this.server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    this.server.use(this.#jWTValidator.jwtValidate.bind(this.#jWTValidator));
    this.server.enable('trust proxy');
  }

  #allowCrosAccess() {
    this.server.use((req, res, next) => {
      var origin = req.headers.origin;

      if (process.env.NODE_ENV !== 'prod') {
        if (origin && origin.match('.braidsight.com')) {
          this.#allowedOrigins.push(origin);
        }
      }

      if (this.#allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }

      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
      );
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Expose-Headers', ' x-response-time');

      req.method === 'OPTIONS' ? res.sendStatus(200) : next();
    });
  }

  #start() {
    this.server.use((req, res) => {
      res.status(HTTPCODES.NOT_FOUND).send(`URL Not Found ${req.url}`);
    });

    this.server.use((err, req, res) => {
      res.status(HTTPCODES.APP_ERROR).send(err);
    });

    this.#dbInstance
      .createConnection()
      .then(connected => {
        if (connected) {
          this.server.listen(this.#port, () => {
            console.info(
              `Server started on PORT: ${this.#port} and ENV: ${
                process.env.NODE_ENV
              }`,
            );
            this.#printRoutes();
          });
        } else {
          () => {
            console.error('Unknown Error');
          };
        }
      })
      .catch(e => {
        console.log({e});
      });

    // let instance = MongoConnector.getInstance();
    // instance.createConnection().then(() => {
    //   this.server.listen(this.#port, () => {
    //     logger.info(
    //       `Application started at port ${this.#port} and env: ${
    //         process.env.NODE_ENV
    //       }`
    //     );
    //     this.#printRoutes();
    //   });
    // }, logger.error);
  }

  #printRoutes() {
    const routes = listEndpoints(this.server);
    routes.forEach(route => {
      route.methods.forEach(method => {
        console.info(`${method}  ${route.path}`);
      });
    });
  }
}

let appServer = new AppServer();
export default appServer.server; // for testing
