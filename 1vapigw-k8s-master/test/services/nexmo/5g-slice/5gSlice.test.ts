import { getHostDomainsList, getHostList, selectedRegion, servicesConf, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { StatusCodes } from 'http-status-codes';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service 5gSlice
 * @lob nexmo
 * @prod euw1 euc1
 * @qa euw1
// * @prodNotifyChannel api-dashboard-monitoring
 */

const service = '5gSlice';

describe('VCP', () => {
  describe.each(getHostList(LobTypes.API))('5g-slice - ', host => {
    let request;

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      const domains = getHostDomainsList(servicesConf[LobTypes.API][service][selectedRegion]);
      describe.each(domains)('%s', domain => {
        test(`GET / - should redirect to VIAM login`, async () => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get('/').set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.headers['location']).toMatch(new RegExp(servicesConf[LobTypes.API][service].signinUrlRegex));
        });

        test(`GET /xyz - should redirect to VIAM login`, async () => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get('/xyz').set(headers);
          expect(response.status).toEqual(StatusCodes.MOVED_TEMPORARILY);
          expect(response.headers['location']).toMatch(new RegExp(servicesConf[LobTypes.API][service].signinUrlRegex));
        });

        test(`GET /_/health - should be 200`, async () => {
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get('/_/health').set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toEqual('OK');
        });
      });
    });
  });
});
