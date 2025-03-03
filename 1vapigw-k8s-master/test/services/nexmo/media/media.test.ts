import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service media
 * @lob nexmo
 * @prod euc1 euw1 use1 usw2 apse1 apse2
 //  * @qa euc1 euw1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'media';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const mediaDomain = getHostDomainsList(servicesConf.api.media[selectedRegion]);
    const downloads_ratelimit_10 =
      '10, 10;w=1;name="crd|generic_key^nexmo-media.media-ip-rate-limiting|generic_key^solo.setDescriptor.uniqueValue|ip_address"';
    const downloads_ratelimit_1000 =
      '1000, 1000;w=1;name="crd|generic_key^nexmo-media.media-ip-rate-limiting|generic_key^solo.setDescriptor.uniqueValue|ip_address"';

    let mediaTestAccount;
    let mediaTestPassword;
    let authorization;
    let headers = {};
    let TRACE_ID;

    beforeAll(async () => {
      mediaTestAccount = await getSecret(servicesConf.api.media[selectedRegion].testAccount);
      mediaTestPassword = await getSecret(servicesConf.api.media[selectedRegion].testPassword);
      authorization = await getSecret(servicesConf.api.media[selectedRegion].authorization);
      request = defaultRequest(host);
      TRACE_ID = '1vapigw-media-test';
      headers[TRACE_ID_HEADER] = TRACE_ID;
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(mediaDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /v3/media/ping - Should return 200', async () => {
          const path = `/v3/media/ping`;
          const response = await request.get(path).set(headers);
          if (response.status == StatusCodes.OK) {
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          } else {
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toEqual('{"status":404}');
          }
        });

        test('POST /v3/media/ping - Should return 403', async () => {
          const path = `/v3/media/ping`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v3/medi - wrong url - Should return 404', async () => {
          const path = `/v3/medi`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        //########

        test('OPTION /v3/media - Should return 200', async () => {
          const path = `/v3/media`;
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.header['allow']).toEqual('HEAD,GET,OPTIONS');
          validateResponseHeaders(response.header);
        });

        test('GET /v3/media - Should return 200', async () => {
          const path = `/v3/media`;
          const _headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const response = await request.get(path).set(_headers).query({
            api_key: mediaTestAccount,
            api_secret: mediaTestPassword,
          });
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('/v3/media?');
          validateResponseHeaders(response.header);
        });

        // TODO: This test should pass. Issue is with caputalisation of the header. Looks correct in postman but not in curl and not here
        // test('GET /v3/media - without host should return 404 + content-disposition', async () => {
        //   const path = `/v3/media`;
        //   const _headers = {
        //     [TRACE_ID_HEADER]: TRACE_ID,
        //     Authorization: authorization,
        //   };
        //   const response = await request.get(path).set(_headers);
        //   expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        //   console.log ('response: ' + JSON.stringify(response));
        //   expect(response.header['Content-Disposition']).toEqual('attachment; filename="api.txt"');
        //   validateResponseHeaders(response.header);
        // });

        test('HEAD /v3/media - Should return 200', async () => {
          const path = `/v3/media`;
          const _headers = {
            Host: domain,
            [TRACE_ID_HEADER]: TRACE_ID,
          };
          const response = await request.head(path).set(_headers).query({
            api_key: mediaTestAccount,
            api_secret: mediaTestPassword,
          });
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /v3/media - Should return 405', async () => {
          const path = `/v3/media`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          expect(response.text).toContain('Method Not Allowed');
          validateResponseHeaders(response.header);
        });

        test('PUT /v3/media - Should return 405', async () => {
          const path = `/v3/media`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          expect(response.text).toContain('Method Not Allowed');
          validateResponseHeaders(response.header);
        });

        test('DELETE /v3/media - Should return 405', async () => {
          const path = `/v3/media`;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          expect(response.text).toContain('Method Not Allowed');
          validateResponseHeaders(response.header);
        });

        test('PATCH /v3/media - Should return 403', async () => {
          const path = `/v3/media`;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        //########

        test('OPTION /v1/files - Should return 200', async () => {
          const path = `/v1/files`;
          const response = await request.options(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.header['allow']).toEqual('GET, HEAD, TRACE, OPTIONS');
          validateResponseHeaders(response.header);
        });

        test('GET /v1/files - Should return 400', async () => {
          const path = `/v1/files`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.text).toContain('Missing parameters');
          validateResponseHeaders(response.header);
        });

        test('HEAD /v1/files - Should return 400', async () => {
          const path = `/v1/files`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/files - Should return 403', async () => {
          const path = `/v1/files`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        //########

        test('GET /media/download - Should return 400', async () => {
          const path = `/media/download`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.text).toContain('Missing parameters');
          validateResponseHeaders(response.header);
        });

        test('HEAD /media/download - Should return 400', async () => {
          const path = `/media/download`;
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          validateResponseHeaders(response.header);
        });

        test('POST /media/download - Should return 403', async () => {
          const path = `/media/download`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /v3/media/:id/info - Should return 404', async () => {
          const path = `/v3/media/12345678-abcd-efgh-ijkl-mnopqrstuvwx/info`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual('{"status":404}');
          validateResponseHeaders(response.header);
          expect(response.header).not.toHaveProperty('x-ratelimit-limit');
        });

        test('DELETE /v3/media/:id - Should return 404', async () => {
          const path = `/v3/media/12345678-abcd-efgh-ijkl-mnopqrstuvwx`;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual('{"status":404}');
          validateResponseHeaders(response.header);
          expect(response.header).not.toHaveProperty('x-ratelimit-limit');
        });

        test('GET /v3/media/:id - Should return 401', async () => {
          const path = `/v3/media/12345678-abcd-efgh-ijkl-mnopqrstuvwx`;
          const noAuthHeaders = { ...headers };
          delete noAuthHeaders['Authorization'];
          const response = await request.get(path).set(noAuthHeaders);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('{"status":401}');
          validateResponseHeaders(response.header);
          if (selectedEnv === 'prod' || selectedEnv === 'qa') {
            expect(response.header['x-ratelimit-limit']).toEqual(downloads_ratelimit_10);
          } else if (selectedEnv === 'dev') {
            expect(response.header['x-ratelimit-limit']).toEqual(downloads_ratelimit_1000);
          }
        });

        test('GET /v3/media/:id/ - Should return 401', async () => {
          const path = `/v3/media/12345678-abcd-efgh-ijkl-mnopqrstuvwx/`;
          const noAuthHeaders = { ...headers };
          delete noAuthHeaders['Authorization'];
          const response = await request.get(path).set(noAuthHeaders);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('{"status":401}');
          validateResponseHeaders(response.header);
          if (selectedEnv === 'prod' || selectedEnv === 'qa') {
            expect(response.header['x-ratelimit-limit']).toEqual(downloads_ratelimit_10);
          } else if (selectedEnv === 'dev') {
            expect(response.header['x-ratelimit-limit']).toEqual(downloads_ratelimit_1000);
          }
        });
      });
    });
  });
});
