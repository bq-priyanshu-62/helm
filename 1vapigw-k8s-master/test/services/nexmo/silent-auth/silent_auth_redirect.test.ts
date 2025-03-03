import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service silent-auth-aggregator
 * @lob nexmo
 * @dev euw1
 * @prod euw1 euc1
 * @prodNotifyChannel vna-alerts
 */

const service = 'silent-auth-aggregator';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const silentDomain = getHostDomainsList(servicesConf.api.silent_auth[selectedRegion]);
    const providers = ['ericsson', 'truid'];

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(silentDomain)('domain - %s', domain => {
        const TRACE_ID = '1vapigw-silent-auth-test';
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: TRACE_ID,
        };

        test('GET /v0.1/silent-auth/redirect/abc?code=123 - Should return 200 and silently ignore invalid silent auth redirect', async () => {
          const path = `/v0.1/silent-auth/redirect/abc?code=123`;
          console.log(path);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('OPTIONS /v0.1/silent-auth/redirect/abc?code=123 - Should return 200 and silently ignore invalid silent auth redirect', async () => {
          const path = `/v0.1/silent-auth/redirect/abc?code=123`;
          console.log(path);
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /v0.1/silent-auth/redirect?code=123 - Should return 200 and silently ignore invalid silent auth redirect', async () => {
          const path = `/v0.1/silent-auth/redirect?code=123`;
          console.log(path);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('OPTIONS /v0.1/silent-auth/redirect?code=123 - Should return 200 and silently ignore invalid silent auth redirect', async () => {
          const path = `/v0.1/silent-auth/redirect?code=123`;
          console.log(path);
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });
      });
    });
  });
});
