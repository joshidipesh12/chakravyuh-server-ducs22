import {Router} from 'express';
import {
  ResponseSuccess,
  ResponseFailure,
  MESSAGES,
} from '../../helpers/index.js';
import {AuthHandler} from './authHandler.js';

/**
 * # 🤔
 */
export class AuthRoute {
  #handler;
  constructor() {
    this.route = Router();
    this.#handler = new AuthHandler();
    this.#init();
  }

  #init() {
    this.route.put('/', this.#signinUser.bind(this));
    this.route.post('/', this.#signupUser.bind(this));
  }

  #signinUser(req, res, next) {
    // define signin logic
    // with if/else
    // from this.#handler.method().then(() => {return 👇}, next)
    // if (wrong_data) ResponseFailure(res, MESSAGES.INVALID_USER, 401);
    return ResponseSuccess(res, {user: 'random-User'}, 200);
  }

  #signupUser(req, res, next) {
    // define signup logic
  }
}
