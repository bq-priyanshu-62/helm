import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';
const retry = require('jest-retries');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service ni-v2
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
 * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = 'ni-v2';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo Number-Insight V2', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const niDomain = getHostDomainsList(servicesConf.api.niV2[selectedRegion]);
    let authorization;
    let authorizationNoQuota;
    const TRACE_ID = '1vapigw-ni-v2-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    const niV2RateLimitPerSecond = servicesConf.api.niV2.niV2RateLimitPerSecond;
    const path = `/v2/ni`;
    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      authorizationNoQuota = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(niDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /v2/ni/ping - Should return 200', async () => {
          const pingPath = `/v2/ni/ping`;
          const response = await request.get(pingPath).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.OK);
          } else {
            // expect(response.status).toEqual(StatusCodes.GATEWAY_TIMEOUT);
            expect([StatusCodes.GATEWAY_TIMEOUT, StatusCodes.SERVICE_UNAVAILABLE]).toContain(response.status);
            // expect(response.text).toContain("upstream request timeout");
            expect(['upstream request timeout', 'no healthy upstream']).toContain(response.text);
          }
          validateResponseHeaders(response.header);
        });

        test('POST /v2/ni - should reject - 422 - Auth header is required', async () => {
          const traceId = '1vapigw-niv2-missing-creds-' + selectedRegion;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);

          const body = JSON.parse(response.text);
          expect(body.detail).toEqual('Auth header is required');
        });

        test('POST /v2/ni - should reject - 401 - invalid creds', async () => {
          const traceId = '1vapigw-niv2-missing-creds-' + selectedRegion;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: 'Basic fooBar',
          };
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);

          const body = JSON.parse(response.text);
          expect(body.detail).toEqual('You did not provide correct credentials.');
        });

        test('POST /v2/ni - should reject - 401 - quota banned', async () => {
          const traceId = '1vapigw-niv2-noquota-' + selectedRegion;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorizationNoQuota,
          };
          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          const body = JSON.parse(response.text);
          expect(body.detail).toEqual('Quota Exceeded - rejected');
        });

        retry('POST /v2/ni - should apply rate limit - 429', 3, async () => {
          const traceId = '1vapigw-niv2-429-' + selectedRegion;
          let responses = [];
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: traceId,
            Authorization: authorization,
          };

          for (let i = 0; i < niV2RateLimitPerSecond + 10; i++) {
            responses.push(request.post(path).set(headers));
          }

          responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);

          expect(responses.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
