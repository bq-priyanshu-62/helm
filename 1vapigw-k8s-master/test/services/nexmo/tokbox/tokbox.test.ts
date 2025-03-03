import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service tokbox
 * @lob nexmo
 * @qa euw1 euc1 use1
 * @prod apse1 apse2 euw1 euc1 use1 usw2
 * @dev euw1 use1
 * @prodNotifyChannel anvil-platform-monitoring
 */

const service = 'tokbox';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const tokboxDomain = getHostDomainsList(servicesConf.api.tokbox[selectedRegion]);
    let authorization;
    let token;

    beforeAll(async () => {
      request = defaultRequest(host);
      token = await getSecret(servicesConf.api.tokbox.token);
      authorization = await getSecret(servicesConf.api.authorization);
    });

    describe(`${service} Video Services`, () => {
      describe.each(tokboxDomain)('domain - %s', domain => {
        test('OPTIONS /session - Should return 200', async () => {
          const path = '/session/' + token;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-1',
            Authorization: authorization,
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /session - Should return 200', async () => {
          const path = '/session/' + token;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-2',
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          if (selectedEnv === 'dev') {
            expect([StatusCodes.BAD_REQUEST, StatusCodes.OK]).toContain(response.status);
          } else {
            expect(response.status).toEqual(StatusCodes.OK);
          }
          if (response.status === StatusCodes.OK) {
            expect(response.text).toContain('ice_credential_expiration');
          }
          validateResponseHeaders(response.header);
        });

        test('POST /session - Should return 405', async () => {
          const path = '/session/' + token;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-tokbox-test-3',
            Authorization: authorization,
          };
          const response = await request.post(path).set(headers);
          //For toxbox envoy returns 405 in case the methods are not allowed
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
