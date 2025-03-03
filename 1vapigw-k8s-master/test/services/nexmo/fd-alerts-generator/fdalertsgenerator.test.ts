import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service fd-alerts-generator
 * @lob nexmo
 * @dev euw1
 * @prod euw1
 * @notifyChannel enforcer-api-dev-alerts
 * @prodNotifyChannel fraud-defender-alerts
 */

const service = 'fd-alerts-generator';

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
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /v0.1/fraud-defender/configuration/custom-rules/SMS/random-test - Should return 403 - (forbidden as it requires permissions)', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/configuration/custom-rules/SMS/random-test`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/configuration/custom-rules/SMS - Should return 402 with invalid auth', async () => {
          headers['Authorization'] = 'Basic bad_credentials';
          const path = `/v0.1/fraud-defender/configuration/custom-rules/SMS`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.PAYMENT_REQUIRED);
        });
      });
    });
  });
});
