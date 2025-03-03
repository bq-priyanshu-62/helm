import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversations_beta
 * @lob nexmo
 * @prod apse2 apse1 euc1 euw1 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'conversations_beta';

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
        test('POST /beta/conversation - Should return 404', async () => {
          const path = `/beta/conversation`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-3',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/conversations - Should return 401', async () => {
          const path = `/beta/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-4',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /beta/conversations - Should return 401', async () => {
          const path = `/beta/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-5',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('POST /beta/knocking - Should return 401', async () => {
          const path = `/beta/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-6',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('HEAD /beta/knocking - Should return 403', async () => {
          const path = `/beta/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-6',
            Authorization: authorization,
          };

          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/knocking -Should return 403', async () => {
          const path = `/beta/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-7',
            Authorization: authorization,
          };
          const response = await request.get(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/devices - Should return 401', async () => {
          const path = `/beta/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-8',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /beta/devices -Should return 403', async () => {
          const path = `/beta/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-9',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/users - Should return 401', async () => {
          const path = `/beta/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-10',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /beta/users -Should return 403', async () => {
          const path = `/beta/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-11',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('POST /beta/sessions - Should return 401', async () => {
          const path = `/beta/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-12',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /beta/sessions -Should return 403', async () => {
          const path = `/beta/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-13',
            Authorization: authorization,
          };
          const response = await request.patch(path).set(headers);
          // console.log(JSON.stringify(response, null, 4));
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /beta/legs - Should return 401', async () => {
          const path = `/beta/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-14',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('COPY /beta/legs -Should return 403', async () => {
          const path = `/beta/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-15',
            Authorization: authorization,
          };
          const response = await request.copy(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        });

        test('OPTIONS /beta/conversations - Should return 204', async () => {
          const path = `/beta/conversations`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-16',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /beta/knocking - Should return 204', async () => {
          const path = `/beta/knocking`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-17',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /beta/devices - Should return 204', async () => {
          const path = `/beta/devices`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-18',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /beta/sessions - Should return 204', async () => {
          const path = `/beta/sessions`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-19',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /beta/legs - Should return 204', async () => {
          const path = `/beta/legs`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-20',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /beta/users - Should return 204', async () => {
          const path = `/beta/users`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-21',
            'access-control-request-method': 'GET',
            origin: 'http://test-url.com',
          };
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NO_CONTENT);
          validateResponseHeaders(response.header);
          validateAccesControlAllowOriginHeader(response.header);
        });

        test('OPTIONS /beta/discovery - Should return 204', async () => {
          const path = `/beta/discovery`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-conversation-test-98',
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
