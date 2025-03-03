import supertest from 'supertest';
import defaults from 'superagent-defaults';
import Agent from 'agentkeepalive';
import { StatusCodes } from 'http-status-codes';
import { WebSocket } from 'ws';

const keepAliveAgent = new Agent.HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

export const defaultRequest = (host, keepAlive = true) => {
  let request;
  request = defaults(supertest(`https://${host}`));
  request.set('User-Agent', '1vapigw-sanity-test');

  if (keepAlive) {
    request.agent(keepAliveAgent);
  }

  return request;
};

export const defaultWSRequest = async (host, path, headers: any = null, messagesCount = 1) => {
  const wss = new WebSocket(`wss://${host}${path}`, {
    headers: headers ? headers : null,
    handshakeTimeout: 5000,
  });
  const messages: any[] = [];
  const errors: any[] = [];

  wss.on('error', async err => {
    errors.push(err);
  });

  await waitForSocketState(wss, wss.OPEN);

  wss.on('message', async data => {
    messages.push(JSON.parse(`${data}`));
    if (messages.length === messagesCount) {
      wss.close();
      await waitForSocketState(wss, wss.CLOSED);
    }
  });

  return { wss, messages, errors };
};

const waitForSocketState = (socket, state, expireDateTime: Date = new Date().addSeconds(15)) => {
  return new Promise<void>(resolve => {
    if (socket.readyState === state || new Date() > expireDateTime) {
      resolve();
    } else {
      setTimeout(() => resolve(waitForSocketState(socket, state, expireDateTime)), 2000);
    }
  });
};

export const retryFor429 = async (request, retriesLeft = 10) => {
  return new Promise<any>(resolve => {
    cloneRequest(request, retriesLeft).then(response => {
      if (retriesLeft > 0 && response.status == StatusCodes.TOO_MANY_REQUESTS) {
        let delay = Math.floor(Math.random() * 10000) + 1000; //Random delay from 1s-10s
        setTimeout(() => resolve(retryFor429(request, retriesLeft - 1)), delay); //retry when status code is 429
      } else {
        return resolve(response);
      }
    });
  });
};

const cloneRequest = (req, retry) => {
  let request;
  request = defaults(supertest(req.app));
  request.agent(keepAliveAgent);
  let path = req.url.replace(req.app, '');

  switch (req.method.toUpperCase()) {
    case 'GET':
      request = request.get(path);
      break;
    case 'POST':
      request = request.post(path);
      break;
    case 'PUT':
      request = request.put(path);
      break;
    case 'PATCH':
      request = request.patch(path);
      break;
    case 'HEAD':
      request = request.head(path);
      break;
    case 'DELETE':
      request = request.delete(path);
      break;
    case 'OPTIONS':
      request = request.options(path);
      break;
    default:
      throw 'error cloning request';
  }

  request.set(req.header);
  request.send(req['_data']);
  request.query(req.qs);
  //request.set('User-Agent', `1vapigw-1-sanity-test-retry-${retry}`); //enable only for debugging when required

  return request;
};

declare global {
  interface Date {
    addSeconds(secs: number): Date;
  }
}

Date.prototype.addSeconds = function (secs: number): Date {
  var date = new Date(this.valueOf());
  date.setSeconds(date.getSeconds() + secs);
  return date;
};
