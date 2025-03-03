import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service reports
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
//  * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel prod-smoke-tests-notifications
 */

const service = 'reports';
const serviceQuota = 'quotaCheck';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let noQuotaAuth;
    let withQuotaAuthorization;
    let headersWithQuota = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };

    let headersNoQuota = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      noQuotaAuth = await getSecret(servicesConf.api.authorization);
      withQuotaAuthorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headersWithQuota['Authorization'] = withQuotaAuthorization;
      headersNoQuota['Authorization'] = noQuotaAuth;
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        beforeAll(async () => {
          headersWithQuota['Host'] = domain;
          headersNoQuota['Host'] = domain;
        });

        test('HEAD /v2/reports - Should return 422', async () => {
          const path = `/v2/reports`;
          const response = await request.head(path).set(headersWithQuota);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/reports - Should return 422', async () => {
          const path = `/v2/reports`;
          const response = await request.get(path).set(headersWithQuota);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/reports - Should return 422', async () => {
          const path = `/v2/reports`;
          const response = await request.post(path).set(headersWithQuota);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          validateResponseHeaders(response.header);
        });

        test('HEAD /v2/reports - Should return 401', async () => {
          const path = `/v2/reports`;
          const response = await request.head(path).set(headersNoQuota);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/reports - Should return 401', async () => {
          const path = `/v2/reports`;
          const response = await request.get(path).set(headersNoQuota);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/reports - Should return 401', async () => {
          const path = `/v2/reports`;
          const response = await request.post(path).set(headersNoQuota);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/reports - Should return 404', async () => {
          const path = `/v2/reports`;
          const response = await request.put(path).set(headersWithQuota);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
