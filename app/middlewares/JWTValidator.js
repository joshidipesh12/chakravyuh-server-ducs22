import dotenv from 'dotenv';
dotenv.config();

import config from 'config';
import {Buffer} from 'buffer';
import {v4 as uuidv4} from 'uuid';
import {OAuth2Client} from 'google-auth-library';

export class JWTValidator {
  #client;
  constructor() {
    this.#client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);
    // TODO(fix): config is using only default env not process.env.NODE_ENV
    this.jwtConfig = config.get('jwtConfig');
  }

  async #authorized(req) {
    var isAuthorzied = false;
    let header = req.headers.authorization;
    if (!header) return isAuthorzied;

    let token = header.split(' ')[1]; // encoded auth token by google
    if (token?.length) {
      const ticket = await this.#client.verifyIdToken({
        idToken: token,
        audience: [], // website CLIENT_ID here
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      if (userid.length) {
        const payload1 = token.split('.')[1]; //TODO: check if payload === payload1
        req.currentUserID = userid || '';
        req.currentUser = Buffer.from(payload1, 'base64').toString('ascii');
        isAuthorzied = true;
      }
    }
    return isAuthorzied;
  }

  #ignoreAuthentication(req) {
    let _ignoreAuthentication = false;

    if (!this.jwtConfig) {
      return _ignoreAuthentication;
    } else {
      var fullUrl = `${req.protocol}://${req.hostname}${req.originalUrl}`;
      let matched;
      for (var urlPattern in this.jwtConfig.ignoreJWTValidationJSON) {
        if (this.jwtConfig.ignoreJWTValidationJSON.hasOwnProperty(urlPattern)) {
          if (!matched) {
            matched = fullUrl.match(urlPattern);
          }
        }
      }
      if (matched && matched.length) {
        _ignoreAuthentication = true;
      }
    }
    return _ignoreAuthentication;
  }

  #notAuthenticated(req, res) {
    var notAuthorized = {code: 0, message: 'Not Authorized', fields: ''};
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).end(JSON.stringify(notAuthorized));
  }

  jwtValidate(req, res, next) {
    req.uniqueReqIdentifier = uuidv4();
    console.info(
      `Validating [${req.method.toUpperCase()}]: ${req.originalUrl} with ID: ${
        req.uniqueReqIdentifier
      }`,
    );
    if (this.#ignoreAuthentication(req)) {
      next();
    } else {
      this.#authorized(req)
        .then(isAuth => {
          if (isAuth) {
            console.info('Request url is authenticated : ' + req.originalUrl);
            next();
          } else this.#notAuthenticated(req, res);
        })
        .catch(e => {
          console.warn(e);
          this.#notAuthenticated(res);
        });
    }
  }
}
