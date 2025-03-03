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
 * @service number-inventory
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = 'number-inventory';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo Number-Inventory', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    const TRACE_ID = '1vapigw-number-inventory-test';
    const domain = getHostDomainsList(servicesConf.api[service][selectedRegion]);

    let request;
    let authorization;
    // let authorizationNoQuota;
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    // const path = `/v2/ni`;
    beforeAll(async () => {
      request = defaultRequest(host);
      // authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(domain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /v0.1/numbers/jobs/test-job - Should return 401', async () => {
          const path = `/v0.1/numbers/jobs/test-job`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /v0.1/numbers/441234567890 - Should return 401', async () => {
          const path = `/v0.1/numbers/441234567890`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /v0.1/numbers - Should return 401', async () => {
          const path = `/v0.1/numbers`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('POST /v0.1/numbers/jobs - Should return 401', async () => {
          const path = `/v0.1/numbers/jobs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        // v1 tests
        test('GET /v1/numbers/jobs/test-job - Should return 401', async () => {
          const path = `/v1/numbers/jobs/test-job`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /v1/numbers/441234567890 - Should return 401', async () => {
          const path = `/v1/numbers/441234567890`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /v1/numbers - Should return 401', async () => {
          const path = `/v1/numbers`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('POST /v1/numbers/jobs - Should return 401', async () => {
          const path = `/v1/numbers/jobs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
            Authorization: 'Bearer invalid_token',
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });
      });
    });
  });
});
