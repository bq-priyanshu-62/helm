import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversations_v0.3
 * @lob nexmo
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'conversations_v0.3';

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
        test('GET /v0.3/conversations - Should return 401', async () => {
          const path = `/v0.3/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-79',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.3/conversations - Should return 401', async () => {
          const path = `/v0.3/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-101',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('COPY /v0.3/conversations -Should return 403', async () => {
          const path = `/v0.3/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-80',
            Authorization: authorization,
          };
          const response = await request.copy(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('POST /v0.3/knocking - Should return 401', async () => {
          const path = `/v0.3/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-81',
            Authorization: authorization,
          };
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('HEAD /v0.3/knocking - Should return 403', async () => {
          const path = `/v0.3/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-82',
            Authorization: authorization,
          };
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.3/knocking -Should return 403', async () => {
          const path = `/v0.3/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-83',
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.3/devices - Should return 401', async () => {
          const path = `/v0.3/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-84',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.3/devices -Should return 403', async () => {
          const path = `/v0.3/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-85',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.3/users - Should return 401', async () => {
          const path = `/v0.3/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-86',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('COPY /v0.3/users -Should return 403', async () => {
          const path = `/v0.3/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-87',
            Authorization: authorization,
          };
          const response = await request.copy(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('POST /v0.3/sessions - Should return 401', async () => {
          const path = `/v0.3/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-88',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v0.3/sessions -Should return 403', async () => {
          const path = `/v0.3/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-89',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v0.3/legs - Should return 401', async () => {
          const path = `/v0.3/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-90',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('COPY /v0.3/legs -Should return 403', async () => {
          const path = `/v0.3/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-91',
            Authorization: authorization,
          };
          const response = await request.copy(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('OPTIONS /v0.3/conversations - Should return 204', async () => {
          const path = `/v0.3/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-92',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.3/knocking - Should return 204', async () => {
          const path = `/v0.3/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-93',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.3/devices - Should return 204', async () => {
          const path = `/v0.3/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-94',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.3/sessions - Should return 204', async () => {
          const path = `/v0.3/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-95',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.3/legs - Should return 204', async () => {
          const path = `/v0.3/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-96',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.3/users - Should return 204', async () => {
          const path = `/v0.3/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-97',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /v0.3/discovery - Should return 204', async () => {
          const path = `/v0.3/discovery`;
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
