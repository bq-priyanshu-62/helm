import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service ignoreAuth
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 apse3 mec1 use1 usw2
 // * @qa // euc1 use1 euw1 //Note that quota isn't in sync outside of euw1 in dev and qa. The quota team is working on it.
 * @dev euw1 // use1
 * @prodNotifyChannel api-gw-notify
 */

const service = 'ignoreAuth';

function validateResponseHeaders(header) {
  //   expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const ignoreAuthDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(ignoreAuthDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('get ping-protected-ignore-auth - Should return 200 with invalid auth', async () => {
          const path = `/ping-protected-ignore-auth`;
          headers['Authorization'] = 'Basic foo';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
          // ensure that in the case where auth failed that we didn't get an auth header
          expect(response.body.requestHeaders).not.toHaveProperty('nexmo-authorization');
        });

        test('get ping-protected-ignore-auth - Should return 200 with missing auth', async () => {
          const path = `/ping-protected-ignore-auth`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
          // console.log(JSON.stringify(response.body.requestHeaders));
          // ensure that in the case where auth failed that we didn't get an auth header
          expect(response.body.requestHeaders).not.toHaveProperty('nexmo-authorization');
        });

        test('get ping-protected-ignore-auth - Should return 200 with valid auth', async () => {
          const path = `/ping-protected-ignore-auth`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
          // make sure that in the valid auth case that auth was processed correctly
          expect(response.body.requestHeaders).toHaveProperty('nexmo-authorization');
        });

        test('get ping-protected-noquota - Should return 401 with invalid auth and ignore header', async () => {
          const path = `/ping-protected-noquota`;
          headers['Authorization'] = 'Basic foo';
          headers['x-ignore-auth-result'] = 'true';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
