import dotenv from 'dotenv';
dotenv.config();

import {Router} from 'express';

import {ResponseSuccess} from '../helpers/index.js';
import {AuthRoute} from './auth/authRoute.js';

export class InitRoutersV1 {
  #authRoute;
  constructor() {
    this.rest = Router();
    this.#authRoute = new AuthRoute();
    this.#init();
  }

  #init() {
    this.rest.get('/info', this.#serverInfo.bind(this));
    this.rest.use('/auth', this.#authRoute.route);
    // other simple or nested routes here
  }

  #serverInfo(req, res, next) {
    const serverInfo = {
      nodeENV: process.env.NODE_ENV,
    };
    return ResponseSuccess(res, serverInfo, 200);
  }
}
