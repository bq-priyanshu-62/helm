import { getHostList, regionConf, servicesConf, selectedRegion } from '../config/get-urls-by-env';
import { getMyIp } from '../utils/get-my-ip';
import { CLIENT_IP_HEADER, FORWARDED_HOST, TRACE_ID_HEADER } from '../consts/consts';
import { LobTypes } from '../consts/lobTypes';
import { rateLimitPerMinuteTest, rateLimitPerSecondTest } from '../utils/rate-limit-tests';
import { StatusCodes } from 'http-status-codes';
import supertest = require('supertest');
import { getSecret } from '../../../utils/get-secret';

/**
 * @group gloo/nexmo
 * @group nexmo
 * @group nexmo/use1
 * @group nexmo/usw2
 * @group nexmo/euc1
 * @group nexmo/euw1
 * @group nexmo/apse1
 * @group nexmo/apse2
 * @environment prod
 * @environment qa
 * @environment dev
 */

describe('Nexmo GLOO', () => {
  let request;

  const regionDomain = regionConf.api.domain;
  let authorization;
  const env = process.env.NODE_ENV.split('.')[0];

  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    beforeAll(async () => {
      request = supertest(`https://${host}`);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    test('GET /gateway/ping - Should return 200', async () => {
      const path = `/gateway/ping`;
      const headers = {
        Host: regionDomain,
      };
      await request.get(path).set(headers).expect(StatusCodes.OK);
    });

    test('GET /gateway/ping-protected - Should return 200', async () => {
      const path = `/gateway/ping-protected`;
      const headers = {
        Host: regionDomain,
        [TRACE_ID_HEADER]: '1vapigw-gloo-test-1',
        Authorization: authorization,
      };

      await request.get(path).set(headers).expect(StatusCodes.OK);
    });

    test('GET /gateway/ping-protected - Missing auth - Should return 401', async () => {
      const path = `/gateway/ping-protected`;
      const headers = {
        Host: regionDomain,
        [TRACE_ID_HEADER]: '1vapigw-gloo-test-2',
        Authorization: 'Basic INVALID',
      };

      await request.get(path).set(headers).expect(StatusCodes.UNAUTHORIZED);
    });
  });

  describe.each(getHostList(LobTypes.API))('Remote client - %s', host => {
    let testerIp;

    beforeAll(async () => {
      request = supertest(`https://${host}`);
      testerIp = await getMyIp();
    });

    test('GET /gateway/ping - Check x-envoy-external-address', async () => {
      const path = `/gateway/ping`;
      const headers = {
        Host: regionDomain,
        [TRACE_ID_HEADER]: '1vapigw-gloo-test-2',
      };

      const response = await request.get(path).set(headers).expect(StatusCodes.OK);

      expect(response.body.requestHeaders['x-envoy-external-address']).toEqual(testerIp);
    });

    test('GET /gateway/ping - Check x-original-client-ip-address', async () => {
      const path = `/gateway/ping`;
      const headers = {
        Host: regionDomain,
        [TRACE_ID_HEADER]: '1vapigw-gloo-test-2',
      };

      const response = await request.get(path).set(headers).expect(StatusCodes.OK);

      expect(response.body.requestHeaders[CLIENT_IP_HEADER]).toEqual(testerIp);
    });

    test('GET /gateway/ping - Set x-original-client-ip-address manually', async () => {
      const ip = '1.2.3.128';
      const path = `/gateway/ping`;
      const headers = {
        Host: regionDomain,
        [TRACE_ID_HEADER]: '1vapigw-gloo-test-2',
        [CLIENT_IP_HEADER]: ip,
      };

      const response = await request.get(path).set(headers).expect(StatusCodes.OK);
      var myIP = env != 'prod' ? ip : testerIp;
      expect(response.body.requestHeaders[CLIENT_IP_HEADER]).toEqual(myIP);
    });

    test('GET /gateway/ping - Check x-forwarded-host', async () => {
      const path = `/gateway/ping`;
      const headers = {
        Host: regionDomain,
        [TRACE_ID_HEADER]: '1vapigw-gloo-test-2',
      };

      const response = await request.get(path).set(headers).expect(StatusCodes.OK);

      expect(response.body.requestHeaders[FORWARDED_HOST]).toMatch(new RegExp(`^${regionDomain}(:\\d+)?$`));
    });
  });

  describe('Nexmo GLOO - Rate Limit', () => {
    rateLimitPerSecondTest(regionConf.api.domain + '/gateway/ping', servicesConf.api.rateLimitPerSecond);

    rateLimitPerMinuteTest(regionConf.api.domain + '/gateway/ping', servicesConf.api.rateLimitPerMinute, servicesConf.api.rateLimitPerSecond);
  });
});
