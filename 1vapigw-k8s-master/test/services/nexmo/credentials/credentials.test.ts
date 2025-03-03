import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service credentials
 * @lob nexmo
 * @prod euc1 euw1 use1 usw2
 * @dev euw1
 * @prodNotifyChannel boa-notifications
 */

const service = 'credentials';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    let authorization;
    let headers = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };
    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      const authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        // Test listing credentials
        test('GET /credentials - Should return 200', async () => {
          const path = `/v1/creds`;
          const response = await request.get(path).set(headers);

          // As noted in nexmo-applications, dev in use1 is configured with the PROD Identity key
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        // Test OAuth without a credential name
        test('GET /oauth - Should return 404', async () => {
          const path = `/oauth`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });
        // Test redirect without state payload (unauthorised)
        test('GET /oauth/redirect - Should return 401', async () => {
          const path = `/oauth/redirect`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
