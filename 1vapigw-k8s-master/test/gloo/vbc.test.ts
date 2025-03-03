import { getHostList, servicesConf } from '../config/get-urls-by-env';
import { LobTypes } from '../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import supertest = require('supertest');

/**
 * @group gloo/vbc
 * @group vbc
 * @group vbc/use1
 * @environment prod
 * @environment qa
 * @environment dev
 */

describe.each(getHostList(LobTypes.UC))('VBC GLOO - host: %p', host => {
  let request;

  beforeAll(async () => {
    request = supertest(`https://${host}`);
  });

  describe('Sanity checks', () => {
    test('GET /health - Should return 200', async () => {
      const path = `/health`;

      await request.get(path).expect(StatusCodes.OK);
    });

    test('GET /healthcheck - Should return 200', async () => {
      const path = `/healthcheck`;

      await request.get(path).expect(StatusCodes.OK);
    });

    test('GET /gateway/ping - Should return 200', async () => {
      const path = `/gateway/ping`;

      await request.get(path).expect(StatusCodes.OK);
    });

    test('GET / - Should return 401', async () => {
      const path = `/`;

      const response = await request.get(path).expect(StatusCodes.UNAUTHORIZED);

      expect(response.error.text).toContain('Full authentication is required to access this resource');
    });
  });

  describe('Sanity checks - with Host header - %s', () => {
    const headers = {
      Host: servicesConf[LobTypes.UC].domains.global[0],
    };

    test('GET /health - Should return 200', async () => {
      const path = `/health`;

      await request.get(path).set(headers).expect(StatusCodes.OK);
    });

    test('GET /gateway/ping - Should return 200', async () => {
      const path = `/gateway/ping`;

      await request.get(path).set(headers).expect(StatusCodes.OK);
    });

    test('GET / - Should return 200', async () => {
      const path = `/`;

      const response = await request.get(path).set(headers).expect(StatusCodes.UNAUTHORIZED);

      expect(response.error.text).toContain('Full authentication is required to access this resource');
    });
  });

  /**
   * CORS are set on virtual service, thus is part of gloo and not the services test
   */
  describe('CORS checks', () => {
    const corsScenarios = [
      ['https://app.vonage.com', true],
      ['https://livecycle.dev', true],
      ['http://livecycle.dev', true],
      ['https://p_e189c6.livecycle.dev', true],
      ['http://invalid.com', false],
      ['http://a.b.livecycle.dev', false],
    ];

    test.each(corsScenarios)('Given domain: %p, expect CORS validation to be: %p', async (domain, isValid) => {
      const response = await request
        .options('/gateway/ping')
        .set({
          origin: domain,
          'access-control-request-method': 'GET',
        })
        .expect(StatusCodes.OK);

      expect(response.headers['access-control-allow-origin']).toEqual(isValid ? domain : undefined);
    });
  });
});
