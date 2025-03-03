import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversations_v0.2
 * @lob nexmo
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'conversations_v0.2';

// @environment dev
function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

function validateAccesControlAllowOriginHeader(header) {
  expect(header['access-control-allow-origin']).toEqual('*');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const conversationDomain = getHostDomainsList(servicesConf.api.conversations.host[selectedRegion]);
    let authorization;

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api.conversations.host[selectedRegion].authorization);
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(conversationDomain)('domain - %s', domain => {
        test('GET /v0.2/conversations - Should return 401', async () => {
          const path = `/v0.2/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-60',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.2/conversations - Should return 401', async () => {
          const path = `/v0.2/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-61',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('POST /v0.2/knocking - Should return 401', async () => {
          const path = `/v0.2/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-62',
            Authorization: authorization,
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('HEAD /v0.2/knocking - Should return 403', async () => {
          const path = `/v0.2/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-63',
            Authorization: authorization,
          };
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.2/knocking -Should return 403', async () => {
          const path = `/v0.2/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-64',
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.2/devices - Should return 401', async () => {
          const path = `/v0.2/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-65',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.2/devices -Should return 403', async () => {
          const path = `/v0.2/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-66',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.2/users - Should return 401', async () => {
          const path = `/v0.2/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-67',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.2/users -Should return 403', async () => {
          const path = `/v0.2/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-68',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
        });

        test('POST /v0.2/sessions - Should return 401', async () => {
          const path = `/v0.2/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-69',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.2/sessions -Should return 403', async () => {
          const path = `/v0.2/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-70',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.2/legs - Should return 401', async () => {
          const path = `/v0.2/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-71',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('COPY /v0.2/legs -Should return 403', async () => {
          const path = `/v0.2/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-72',
            Authorization: authorization,
          };
          const response = await request.copy(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('OPTIONS /v0.2/conversations - Should return 204', async () => {
          const path = `/v0.2/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-73',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.2/knocking - Should return 204', async () => {
          const path = `/v0.2/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-74',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.2/devices - Should return 204', async () => {
          const path = `/v0.2/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-75',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.2/sessions - Should return 204', async () => {
          const path = `/v0.2/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-76',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.2/legs - Should return 204', async () => {
          const path = `/v0.2/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-77',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.2/users - Should return 204', async () => {
          const path = `/v0.2/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-78',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.2/discovery - Should return 204', async () => {
          const path = `/v0.2/discovery`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-100s',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });
      });
    });
  });
});
