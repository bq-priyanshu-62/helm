import { getHostDomainsList, getHostList, selectedRegion, servicesConf, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service dashboard
 * @lob nexmo
 * @prod euw1 euc1
 * @qa euw1
 * @prodNotifyChannel api-dashboard-monitoring
 */

const service = 'dashboard';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Dashboard Sanity - ', host => {
    let request;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      const domains = getHostDomainsList(servicesConf[LobTypes.API][service][selectedRegion]);
      describe.each(domains)('%s', domain => {
        describe.each(['/ping'])('GET %s - Should return 200', url => {
          test(`GET ${url} - Should return 200`, async () => {
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
            };
            const response = await request.get(url).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
          });
        });

        describe.each(['/api/v1/userinfo', '/api/v1/video'])('GET %s - Should return 302', path => {
          test(`GET ${path} - should redirect to VIAM login`, async () => {
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
            };
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
            expect(response.headers['location']).toMatch(new RegExp(servicesConf[LobTypes.API][service].signinUrlRegex));
          });
        });

        describe.each(['/api/v1/userinfo', '/api/v1/video'])('%s', path => {
          test(`GET ${path} - with incorrect auth header should return 401`, async () => {
            const headers = {
              Host: domain,
              Authorization: 'Bearer testToken',
              [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
            };
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });
        });

        describe.each(['/dist/favicon.ico', '/public/test-route'])('GET %s - Should return 200', path => {
          test('GET  - should return 200 without auth', async () => {
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
            };
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
          });
        });
      });

      describe.each(servicesConf[LobTypes.API][service].externalSites.domains)('%s', domain => {
        if (!domain) {
          return;
        }
        describe.each(['/ping'])('%s', url => {
          test(`GET ${url} - Should return 404`, async () => {
            const headers = {
              Host: domain,
              [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
            };
            const response = await request.get(url).set(headers);
            if (selectedEnv === 'prod') {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            } else {
              expect(response.status).toEqual(StatusCodes.SERVICE_UNAVAILABLE);
            }
          });
        });
      });
    });
  });
});
