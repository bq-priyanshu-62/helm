import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service emergency-number-addr-prov
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'emergency-number-addr-prov';

function validateResponseHeaders(header) {
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
  expect(header['content-type']).toEqual('application/json');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;
    let badAuth;
    let headers = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };

    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      badAuth = 'bad-auth';
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          Authorization: authorization,
          'Content-Type': 'application/json',
        };

        const badAuthHeaders = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          Authorization: badAuth,
          'Content-Type': 'application/json',
        };

        test('HEAD /v1/emergency/numbers - Should return 403', async () => {
          const path = `/v1/emergency/numbers`;
          headers['Authorization'] = authorization;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('GET /v1/emergency/numbers - Should return 403', async () => {
          const path = `/v1/emergency/numbers`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('PATCH /v1/emergency/numbers/12345678901 - Should return 400', async () => {
          const path = `/v1/emergency/numbers/12345678901`;
          headers['Authorization'] = authorization;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          //validateResponseHeaders(response.header);
        });

        test('GET /v1/emergency/numbers/12345678901 - Should return 403', async () => {
          const path = `/v1/emergency/numbers/12345678901`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });
      });
    });
  });
});
