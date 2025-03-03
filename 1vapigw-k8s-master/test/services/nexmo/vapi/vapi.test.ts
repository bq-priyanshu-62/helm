import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv, selectedCluster } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service vapi
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

//TODO: Several tests have been commented out because they are expected to trigger a 500 from VAPI.
//These should go back either by fixing the tests to perform a valid request or by making Vapi respond more gracefully

const service = 'vapi';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

function validateResponse(response, expectStatusCode, expectFn) {
  if (typeof expectStatusCode === 'number') {
    expectStatusCode = [expectStatusCode];
  }
  if (selectedEnv === 'prod') {
    expectFn();
  } else {
    expect([StatusCodes.SERVICE_UNAVAILABLE, StatusCodes.BAD_GATEWAY, StatusCodes.GATEWAY_TIMEOUT, ...expectStatusCode]).toContain(response.status);
    if (response.status == StatusCodes.BAD_GATEWAY && response.text) {
      expect(response.text).toContain('<center>nginx</center>');
    }
  }
}

describe('Nexmo VAPI Services', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;

    const vapiDomain = getHostDomainsList(servicesConf.api.vapi[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      if (selectedEnv == 'dev' && selectedCluster == '1') {
        authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      } else {
        authorization = await getSecret(servicesConf.api.authorization);
      }
    });

    describe(`${service} Services`, () => {
      describe.each(vapiDomain)('domain - %s', domain => {
        test('HEAD /v1/calls/ping - Should return 200', async () => {
          const path = `/v1/calls/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-1',
          };

          const response = await request.head(path).set(headers);
          validateResponse(response, StatusCodes.OK, () => {
            if (response.status == StatusCodes.OK) {
              expect(response.status).toEqual(StatusCodes.OK);
            } else {
              //Aws instances can return 500
              expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
            }
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v1/calls/ping - Should return 200', async () => {
          const path = `/v1/calls/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-2',
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.OK, () => {
            if (response.status == StatusCodes.OK) {
              expect(response.status).toEqual(StatusCodes.OK);
            } else {
              //Aws instances can return 500
              expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
              expect(response.text).toEqual('{"type":"INTERNAL_SERVER_ERROR","error_title":"Internal Server Error"}');
            }
          });
          validateResponseHeaders(response.header);
        });

        test('POST /v1/calls/ping - Should return 403', async () => {
          const path = `/v1/calls/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-3',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          // aws returns 405
          validateResponse(response, [StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.FORBIDDEN], () => {
            if (response.status == StatusCodes.FORBIDDEN) {
              expect(response.status).toEqual(StatusCodes.FORBIDDEN);
              expect(response.text).toEqual(envoy403);
            } else {
              expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
              expect(response.text).toEqual('{"type":"METHOD_NOT_ALLOWED","error_title":"Method Not Allowed"}');
            }
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v1/call - wrong url - Should return 404', async () => {
          const path = `/v1/call`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-4',
            Authorization: 'Basic INVALID',
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.NOT_FOUND, () => {
            // console.log(JSON.stringify(response, null, 4));
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual(envoy404);
          });
          validateResponseHeaders(response.header);
        });

        test('HEAD /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-5',
          };

          const response = await request.head(path).set(headers);
          // dev return 401
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-6',
          };

          const response = await request.get(path).set(headers);
          // dev return 401
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toContain('Unauthorized');
          });
          validateResponseHeaders(response.header);
        });

        test('POST /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-7',
          };

          const response = await request.post(path).set(headers);
          // dev return 401
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toContain('Unauthorized');
          });
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/calls - Should return 405', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-8',
            Authorization: authorization,
          };

          const response = await request.delete(path).set(headers);
          validateResponse(response, StatusCodes.METHOD_NOT_ALLOWED, () => {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('"Method Not Allowed"');
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/calls - Should return 405', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-9',
            Authorization: authorization,
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.METHOD_NOT_ALLOWED, () => {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('"Method Not Allowed"');
          });
          validateResponseHeaders(response.header);
        });

        test('PATCH /v1/calls - Should return 403', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-10',
            Authorization: authorization,
          };

          const response = await request.patch(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
          });
          validateResponseHeaders(response.header);
        });

        test('HEAD /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-11',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.head(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-12',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('POST /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-13',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.post(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-14',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.delete(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/calls - Should return 401', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-15',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('PATCH /v1/calls - Should return 403', async () => {
          const path = `/v1/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-16',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.patch(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          });
          validateResponseHeaders(response.header);
        });

        //########

        test('HEAD /v2/calls/ping - Should return 200', async () => {
          const path = `/v2/calls/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-17',
          };

          const response = await request.head(path).set(headers);
          validateResponse(response, StatusCodes.OK, () => {
            expect(response.status).toEqual(StatusCodes.OK);
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v2/calls/ping - Should return 200', async () => {
          const path = `/v2/calls/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-18',
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.OK, () => {
            expect(response.status).toEqual(StatusCodes.OK);
          });
          validateResponseHeaders(response.header);
        });

        test('POST /v2/calls/ping - Should return 403', async () => {
          const path = `/v2/calls/ping`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-19',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          // aws returns 405
          validateResponse(response, [StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.FORBIDDEN], () => {
            if (response.status == StatusCodes.FORBIDDEN) {
              expect(response.status).toEqual(StatusCodes.FORBIDDEN);
              expect(response.text).toEqual(envoy403);
            } else {
              expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
              expect(response.text).toEqual('{"type":"METHOD_NOT_ALLOWED","error_title":"Method Not Allowed"}');
            }
          });
          validateResponseHeaders(response.header);
        });

        test('HEAD /v2/calls - Should return 405', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-20',
            Authorization: authorization,
          };

          const response = await request.head(path).set(headers);
          validateResponse(response, StatusCodes.METHOD_NOT_ALLOWED, () => {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toBeUndefined();
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v2/calls - Should return 405', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-21',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.METHOD_NOT_ALLOWED, () => {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('"Method Not Allowed"');
          });
          validateResponseHeaders(response.header);
        });

        test('POST /v2/calls - Should return 401', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-22',
            Authorization: authorization,
          };

          const response = await request.post(path).set(headers);
          // dev returns 401
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/calls - Should return 405', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-23',
            Authorization: authorization,
          };

          const response = await request.delete(path).set(headers);
          validateResponse(response, StatusCodes.METHOD_NOT_ALLOWED, () => {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('"Method Not Allowed"');
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/calls - Should return 405', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-24',
            Authorization: authorization,
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.METHOD_NOT_ALLOWED, () => {
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('"Method Not Allowed"');
          });
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/calls - Should return 403', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-25',
            Authorization: authorization,
          };

          const response = await request.patch(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
          });
          validateResponseHeaders(response.header);
        });

        test('HEAD /v2/calls - Should return 401', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-26',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.head(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v2/calls - Should return 401', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-27',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('POST /v2/calls - Should return 401', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-28',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.post(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/calls - Should return 401', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-29',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.delete(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/calls - Should return 401', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-30',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/calls - Should return 403', async () => {
          const path = `/v2/calls`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-31',
            Authorization: 'Bearer INVALID',
          };

          const response = await request.patch(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/conversations/CON-abc-def-agage/record - Should return 401', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/record`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-32',
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v1/conversations/CON-abc-def-agage/record - Should return 403', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/record`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-33',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/conversations/CON-abc-def-agage/talk - Should return 401', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/talk`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-32',
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/conversations/CON-abc-def-agage/talk - Should return 403', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/talk`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-33',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/conversations/CON-abc-def-agage/stream - Should return 401', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/stream`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-32',
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/conversations/CON-abc-def-agage/stream - Should return 403', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/stream`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-33',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
          });
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/conversations/CON-abc-def-agage/ncco - Should return 401', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/ncco`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-34',
          };

          const response = await request.put(path).set(headers);
          validateResponse(response, StatusCodes.UNAUTHORIZED, () => {
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toEqual('{"type":"UNAUTHORIZED","error_title":"Unauthorized"}');
          });
          validateResponseHeaders(response.header);
        });

        test('OPTIONS /v1/conversations/CON-abc-def-agage/ncco - Should return 403', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/ncco`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-35',
            Authorization: authorization,
          };

          const response = await request.options(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          });
          validateResponseHeaders(response.header);
        });

        test('GET /v1/conversations/CON-abc-def-agage/ncco - Should return 403', async () => {
          const path = `/v1/conversations/CON-abc-def-agage/ncco`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-36',
            Authorization: authorization,
          };

          const response = await request.get(path).set(headers);
          validateResponse(response, StatusCodes.FORBIDDEN, () => {
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
          });
          validateResponseHeaders(response.header);
        });

        test('POST /events - Should return 404', async () => {
          const path = `/events`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-37',
          };

          const response = await request.post(path).set(headers);
          validateResponse(response, StatusCodes.NOT_FOUND, () => {
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual(envoy404);
          });
          validateResponseHeaders(response.header);
        });

        test('POST /events/conversation - Should return 404', async () => {
          const path = `/events/conversation`;
          const headers = {
            Host: domain,
            [TRACE_ID_HEADER]: '1vapigw-vapi-test-37',
          };

          const response = await request.post(path).set(headers);
          validateResponse(response, StatusCodes.NOT_FOUND, () => {
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual(envoy404);
          });
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
