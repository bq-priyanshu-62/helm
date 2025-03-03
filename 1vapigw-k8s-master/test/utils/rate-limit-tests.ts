import supertest = require('supertest');
import { StatusCodes } from 'http-status-codes';

const retry = require('jest-retries');

export const rateLimitPerSecondTest = (host, max, headers = {}) => {
  retry(`Rate limit per second - ${max} - ${host}`, 3, async () => {
    const request = supertest(`https://${host}`);

    let responses = [];

    for (let i = 0; i < max + 1; i++) {
      responses.push(request.get('').set(headers));
    }

    responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

    expect(responses.length).toBeGreaterThan(0);
  });
};

export const rateLimitPerMinuteTest = (host, max, perSecond, headers = {}) => {
  const totalRuns = (max / perSecond) * 2;

  retry(`Rate limit per minute - ${max} - ${host}`, totalRuns, async () => {
    await new Promise(r => setTimeout(r, 1000));

    const request = supertest(`https://${host}`);

    let responses = [];

    for (let i = 0; i < perSecond - 1; i++) {
      responses.push(request.get('').set(headers));
    }

    responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

    expect(responses.length).toBeGreaterThan(0);
  });
};

export const rateLimitPerSecondFromDifferentIpsTest = (host, max, headers = {}) => {
  retry(`Rate limit per second from different ips - ${max} - ${host}`, 3, async () => {
    const request = supertest(`https://${host}`);

    let responses = [];

    for (let i = 0; i < max * 2; i++) {
      const rand = Math.random().toString(36);
      const headersWithIp = {
        ...headers,
        'x-original-client-ip-address': rand,
      };
      responses.push(request.get('').set(headersWithIp));
    }

    responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

    expect(responses.length).toEqual(0);
  });
};
