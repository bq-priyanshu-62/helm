import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service tts
 * @lob nexmo
 * @prod euc1 euw1 use1 usw2 apse1 apse2
//  * @qa euc1 euw1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'tts';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const ttsDomain = getHostDomainsList(servicesConf.api.tts[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(ttsDomain)('domain - %s', domain => {
        const TRACE_ID = '1vapigw-tts-test';
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: TRACE_ID,
        };

        test('HEAD /tts/ping - Should return 200', async () => {
          const path = `/tts/ping`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /tts/ping - Should return 200', async () => {
          const path = `/tts/ping`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /tts/ping - Should return 200', async () => {
          const path = `/tts/ping`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PATCH /tts/ping - Should return 403', async () => {
          const path = `/tts/ping`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /tts - wrong url - Should return 404', async () => {
          const path = `/tts`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /tts/json - Should return 200', async () => {
          const path = `/tts/json`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing api_key');
          validateResponseHeaders(response.header);
        });

        test('HEAD /tts/json - Should return 200', async () => {
          const path = `/tts/json`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /tts/json - Should return 200', async () => {
          const path = `/tts/json`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing api_key');
          validateResponseHeaders(response.header);
        });

        test('PATCH /tts/json - Should return 403', async () => {
          const path = `/tts/json`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /tts/json - With api_key - Should return 200', async () => {
          const path = `/tts/json`;
          const response = await request.get(path).set(headers).query({ api_key: 'foo', api_secret: 'bar' });
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Bad Credentials');
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /tts/xml - Should return 200', async () => {
          const path = `/tts/xml`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing api_key');
          validateResponseHeaders(response.header);
        });

        test('HEAD /tts/xml - Should return 200', async () => {
          const path = `/tts/xml`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /tts/xml - Should return 200', async () => {
          const path = `/tts/xml`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Missing api_key');
          validateResponseHeaders(response.header);
        });

        test('PATCH /tts/xml - Should return 403', async () => {
          const path = `/tts/xml`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /tts/xml - With api_key - Should return 200', async () => {
          const path = `/tts/xml`;
          const response = await request.get(path).set(headers).query({ api_key: 'foo', api_secret: 'bar' });
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('Bad Credentials');
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
