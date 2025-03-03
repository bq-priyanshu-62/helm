import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service phub-pools
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'phub-pools';

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

        test('HEAD /v1/pools - Should return 405', async () => {
          const path = `/v1/pools`;
          const response = await request.head(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
          }
          validateResponseHeaders(response.header);
        });

        test('GET /v1/pools - Should return 406', async () => {
          const path = `/v1/pools`;
          const response = await request.get(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.NOT_ACCEPTABLE);
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.body.toString()).toContain('nginx: no configuration for Host');
          }
          validateResponseHeaders(response.header);
        });

        test('POST /v1/pools - Should return 406', async () => {
          const path = `/v1/pools`;
          const response = await request.post(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.NOT_ACCEPTABLE);
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.body.toString()).toContain('nginx: no configuration for Host');
          }
          validateResponseHeaders(response.header);
        });

        test('PATCH /v1/pools - Should return 406', async () => {
          const path = `/v1/pools`;
          const response = await request.patch(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.NOT_ACCEPTABLE);
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.body.toString()).toContain('nginx: no configuration for Host');
          }
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/pools - Should return 406', async () => {
          const path = `/v1/pools`;
          const response = await request.delete(path).set(headers);
          if (selectedEnv === 'prod' || selectedEnv === 'dev') {
            expect(response.status).toEqual(StatusCodes.NOT_ACCEPTABLE);
          } else {
            expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            expect(response.body.toString()).toContain('nginx: no configuration for Host');
          }
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/pools - Should return 403', async () => {
          const path = `/v1/pools`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
