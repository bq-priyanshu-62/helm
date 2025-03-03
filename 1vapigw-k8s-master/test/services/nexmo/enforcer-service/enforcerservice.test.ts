import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service enforcer-service
 * @lob nexmo
 * @dev euw1
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @notifyChannel enforcer-api-dev-alerts
 * @prodNotifyChannel enforcer-api-prod-alerts fraud-defender-alerts
 */

const service = 'enforcer-service';

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

        test('POST /blocks with non-number - Should return 400', async () => {
          headers['Authorization'] = authorization;
          const path = `/blocks`;
          const payload = {
            product: 'voice',
            prefix: 'v2nonNumberGwSanityTest',
            reason: 'someValidReason',
            action: 'block',
          };

          const response = await retryFor429(request.post(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          validateResponseHeaders(response.header);
        });

        test('GET /blocks - Should return 200', async () => {
          headers['Authorization'] = authorization;
          const path = `/blocks?product=sms&archived=no`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/rules - Should return 200', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/rules?product=sms&archived=no`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/rules - Should return 402 with invalid auth', async () => {
          headers['Authorization'] = 'Basic bad_credentials';
          const path = `/v0.1/fraud-defender/rules?product=sms&archived=no`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.PAYMENT_REQUIRED);
        });

        test(`GET /v0.1/fraud-defender/rules/notAnInteger - Should return 404`, async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/rules/notAnInteger`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/fraud-defender/check - Should return 403 when no capability present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/check`;

          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/fraud-defender/check - Should return 401 with invalid auth', async () => {
          headers['Authorization'] = 'Basic bad_credentials';
          const path = `/v0.1/fraud-defender/check`;

          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test(`GET /v0.1/fraud-defender/check - Should return 404`, async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/check`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test(`GET /blocks/notAnInteger - Should return 404`, async () => {
          headers['Authorization'] = authorization;
          const path = `/blocks/v2notAnIntegerGwSanityTest`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test(`PATCH /blocks/notAnInteger - Should return 404`, async () => {
          headers['Authorization'] = authorization;
          const path = `/blocks/v2notAnIntegerGwSanityTest`;
          const payload = {
            reason: 'someValidReason',
          };

          const response = await retryFor429(request.patch(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('DELETE /blocks with non-number - Should return 404', async () => {
          headers['Authorization'] = authorization;
          const path = `/blocks/v2nonNumber`;

          const response = await retryFor429(request.delete(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('PUT /v0.1/fraud-defender/configurations/protections/ait/sms - Should return 403 when no VCP Enforcer permission present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/configurations/protections/ait/sms`;
          const payload = {
            data: {
              default_protection_level: 'STANDARD',
              protection_enabled: false,
            },
          };

          const response = await retryFor429(request.put(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/configurations/protections/ait/sms - Should return 403 when no VCP Enforcer permission present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/configurations/protections/ait/sms`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/fraud-defender/configurations/protections/ait/sms - Should return 404', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/configurations/protections/ait/sms`;

          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/permissions - Should return 200', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/permissions`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/protection-configuration/absolute-burst - Should return 403 when no VCP Enforcer permission present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/protection-configuration/absolute-burst`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.1/fraud-defender/protection-configuration/absolute-burst/1 - Should return 403 when no VCP Enforcer permission present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/protection-configuration/absolute-burst/1`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('DELETE /v0.1/fraud-defender/protection-configuration/absolute-burst/1 - Should return 403 when no VCP Enforcer permission present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/protection-configuration/absolute-burst/1`;

          const response = await retryFor429(request.delete(path).set(headers));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.1/fraud-defender/protection-configuration/absolute-burst - Should return 403 when no VCP Enforcer permission present', async () => {
          headers['Authorization'] = authorization;
          const path = `/v0.1/fraud-defender/protection-configuration/absolute-burst`;
          const payload = {
            destination_countries: ['RU'],
            block_value: 1,
          };

          const response = await retryFor429(request.post(path).set(headers).send(payload));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
