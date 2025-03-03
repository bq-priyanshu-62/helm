import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service cs-ips
 * @lob nexmo
 * @dev euw1
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'cs-ips';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const csIpsDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let authorization;

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api[service][selectedRegion].authorization);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(csIpsDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('HEAD /v1/image/ping - Should return 200', async () => {
          const path = `/v1/image/ping`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/image/ping - Should return 200', async () => {
          const path = `/v1/image/ping`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/image/ping - Should return 403', async () => {
          const path = `/v1/image/ping`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/image - Should return 401', async () => {
          const path = `/v1/image`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.error_title).toContain('Unauthorized');
          validateResponseHeaders(response.header);
        });

        test('POST /v1/image - Providing auth - Should return 401', async () => {
          const path = `/v1/image`;
          const response = await request.post(path).set({ ...headers, ...{ Authorization: authorization } });
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.error_title).toContain('Unauthorized');
          validateResponseHeaders(response.header);
        });

        test('OPTIONS /v1/image - Should return 200', async () => {
          const path = `/v1/image`;
          const cors = {
            origin: domain,
            ['access-control-request-method']: 'GET',
          };
          const response = await request.options(path).set({ ...headers, ...cors });
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.headers['access-control-allow-origin']).toEqual(cors.origin);
          expect(response.headers['access-control-allow-methods']).toEqual('POST,OPTIONS');
        });

        test('GET /v1/image - Should return 403', async () => {
          const path = `/v1/image`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
