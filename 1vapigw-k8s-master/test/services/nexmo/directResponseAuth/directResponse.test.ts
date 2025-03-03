import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service directresponse
 * @lob nexmo
//  * @prod euw1 euc1 apse1 apse2 apse3 mec1 use1 usw2
 * @dev euw1 use1
 * @qa euw1 euc1 use1
 * @prodNotifyChannel api-gw-notify
 */

const service = 'directresponse';

describe('Nexmo direct response auth tests', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    const directResponseDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(directResponseDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('get directResponseWithAuth - Should return 401 with invalid auth', async () => {
          const path = `/directResponseWithAuth`;
          headers['Authorization'] = 'Basic foo';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('get directResponseWithAuth - Should return 422 with missing auth', async () => {
          const path = `/directResponseWithAuth`;
          const noAuthHeaders = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get(path).set(noAuthHeaders);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        test('get directResponseWithAuth - Should return 200 with valid auth', async () => {
          const path = `/directResponseWithAuth`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('success');
        });

        test('get directResponseNoAuth - Should return 200 with invalid auth', async () => {
          const path = `/directResponseNoAuth`;
          headers['Authorization'] = 'Basic foo';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('success');
        });

        test('get directResponseNoAuth - Should return 200 with missing auth', async () => {
          const path = `/directResponseNoAuth`;
          const noAuthHeaders = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get(path).set(noAuthHeaders);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('success');
        });

        test('get directResponseNoAuth - Should return 200 with valid auth', async () => {
          const path = `/directResponseNoAuth`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('success');
        });

        test('get directResponseWithDefaultAuth - Should return 401 with invalid auth', async () => {
          const path = `/directResponseWithDefaultAuth`;
          headers['Authorization'] = 'Basic foo';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('get directResponseWithDefaultAuth - Should return 422 with missing auth', async () => {
          const path = `/directResponseWithDefaultAuth`;
          const noAuthHeaders = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get(path).set(noAuthHeaders);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        test('get directResponseWithDefaultAuth - Should return 200 with valid auth', async () => {
          const path = `/directResponseWithDefaultAuth`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('success');
        });

        test('get /ping-no-auth - Should return 200 with invalid auth', async () => {
          const path = `/ping-no-auth`;
          headers['Authorization'] = 'Basic foo';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.body.requestHeaders).not.toHaveProperty('nexmo-authorization');
        });

        test('get /ping-no-auth - Should return 200 with missing auth', async () => {
          const path = `/ping-no-auth`;
          const noAuthHeaders = {
            Host: domain,
            [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
          };
          const response = await request.get(path).set(noAuthHeaders);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.body.requestHeaders).not.toHaveProperty('nexmo-authorization');
        });

        test('get /ping-no-auth - Should return 200 with valid auth', async () => {
          const path = `/ping-no-auth`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.body.requestHeaders).toHaveProperty('nexmo-authorization');
          expect(response.body.requestHeaders).toHaveProperty('x-ignore-auth-result');
          expect(response.body.requestHeaders['x-ignore-auth-result']).toEqual('true');
        });
      });
    });
  });
});
