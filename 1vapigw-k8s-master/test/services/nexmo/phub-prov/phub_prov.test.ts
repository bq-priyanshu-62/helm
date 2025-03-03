import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service phub-prov
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'phub-prov';

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

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('HEAD /v1/provisioning - Should return 404', async () => {
          const path = `/v1/provisioning`;
          const response = await request.head(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
          }
          validateResponseHeaders(response.header);
        });

        test('GET /v1/provisioning - Should return 404', async () => {
          const path = `/v1/provisioning`;
          const response = await request.get(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toContain('Powered by Jetty');
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.body.toString()).toContain('nginx: no configuration');
          }
          validateResponseHeaders(response.header);
        });

        test('POST /v1/provisioning - Should return 405', async () => {
          const path = `/v1/provisioning`;
          const response = await request.post(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('Powered by Jetty');
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.body.toString()).toContain('nginx: no configuration');
          }
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/provisioning - Should return 403', async () => {
          const path = `/v1/provisioning`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
