import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service push
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
//  * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'push';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

function validateRegexResponse(cfg, response) {
  if (cfg.isValidUUID) {
    expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
    expect(response.body.error_title).toContain('Method Not Allowed');
  } else {
    expect(response.status).toEqual(StatusCodes.NOT_FOUND);
    expect(response.text).toEqual(envoy404);
  }
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('HEAD /v1/push/ping - Should return 200', async () => {
          const path = `/v1/push/ping`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/push/ping - Should return 200', async () => {
          const path = `/v1/push/ping`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/push/ping - Should return 403', async () => {
          const path = `/v1/push/ping`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/push/ping-nonsense - wrong url - Should return 404', async () => {
          const path = `/v1/push/ping-nonsense`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/push/notify - Should return 401', async () => {
          const path = `/v1/push/notify`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.error_title).toContain('Unauthorized');
          validateResponseHeaders(response.header);
        });

        test('GET /v1/push/notify - Should return 403', async () => {
          const path = `/v1/push/notify`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        const testConfigs = [
          { uuid: '28767f7e-31bc-4a56-b6a8-fab9df39d3fb', isValidUUID: true },
          { uuid: 'e61033e8-649b-40ca-afef-4827e45ba51a', isValidUUID: true },
          //{ uuid: 'non-sense', isValidUUID: false }, //Using this will cause the route to match against a route specified by applications service. That means the test behaviour will depend on the behaviour of that service and which domains it supports
        ];

        describe.each(testConfigs)('uuid - %s', cfg => {
          test(`HEAD /v1/applications/${cfg.uuid}/push_tokens`, async () => {
            const path = `/v1/applications/${cfg.uuid}/push_tokens`;
            const response = await request.head(path).set(headers);
            if (cfg.isValidUUID) {
              expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            }
            validateResponseHeaders(response.header);
          });

          test(`GET /v1/applications/${cfg.uuid}/push_tokens`, async () => {
            const path = `/v1/applications/${cfg.uuid}/push_tokens`;
            const response = await request.get(path).set(headers);
            validateRegexResponse(cfg, response);
            validateResponseHeaders(response.header);
          });

          test(`POST /v1/applications/${cfg.uuid}/push_tokens`, async () => {
            const path = `/v1/applications/${cfg.uuid}/push_tokens`;
            const response = await request.post(path).set(headers);
            validateRegexResponse(cfg, response);
            validateResponseHeaders(response.header);
          });

          test(`DELETE /v1/applications/${cfg.uuid}/push_tokens`, async () => {
            const path = `/v1/applications/${cfg.uuid}/push_tokens`;
            const response = await request.delete(path).set(headers);
            if (cfg.isValidUUID) {
              expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
              expect(response.body.error_title).toContain('Unauthorized');
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toEqual(envoy404);
            }
            validateResponseHeaders(response.header);
          });

          test(`PUT /v1/applications/${cfg.uuid}/push_tokens`, async () => {
            const path = `/v1/applications/${cfg.uuid}/push_tokens`;
            const response = await request.put(path).set(headers);
            validateRegexResponse(cfg, response);
            validateResponseHeaders(response.header);
          });

          if (cfg.isValidUUID) {
            test(`PATCH /v1/applications/${cfg.uuid}/push_tokens - Should return 403`, async () => {
              const path = `/v1/applications/${cfg.uuid}/push_tokens`;
              const response = await request.patch(path).set(headers);
              expect(response.status).toEqual(StatusCodes.FORBIDDEN);
              expect(response.text).toEqual(envoy403);
              validateResponseHeaders(response.header);
            });
          }
        });
      });
    });
  });
});
