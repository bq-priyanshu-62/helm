import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service camara-oauth
 * @lob nexmo
 * @dev euw1
 * @prod euw1 euc1
 * @prodNotifyChannel vna-alerts
 */

const service = 'camara-oauth';

describe('Camara Oauth', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const silentDomain = getHostDomainsList(servicesConf.api.silent_auth[selectedRegion]);
    const providers = ['ericsson', 'truid'];

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(silentDomain)('domain - %s', domain => {
        const TRACE_ID = '1vapigw-camara-oauth-test';
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: TRACE_ID,
        };

        const headersWithAuth = {
          Host: domain,
          [TRACE_ID_HEADER]: TRACE_ID,
          Authorization: 'Basic xxx',
        };

        test('GET /oauth2/auth - Should return 400 - Missing required query params', async () => {
          const path = `/oauth2/auth`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        });

        test('POST /oauth2/auth - Should return 404 - Only GET supported', async () => {
          const path = `/oauth2/auth`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });

        test('GET /oauth2/auth - Should return 400 - No gateway auth needed, it still reaches backend with invalid credentials', async () => {
          const path = `/oauth2/auth`;
          const response = await request.get(path).set(headersWithAuth);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        });

        test('GET /oauth2/auth/test - Should return 404 - The exact route match needed', async () => {
          const path = `/oauth2/auth/test`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });
      });
    });
  });
});
