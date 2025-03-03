import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service camara
 * @lob api
 * @prod euc1 euw1
 * @dev euw1
 * @prodNotifyChannel vna-alerts
 */

const service = 'camara';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Vonage Camara QoD', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const camaraDomain = getHostDomainsList(servicesConf.api.camara[selectedRegion]);
    let authorization;
    let has_quota_authorization;
    const TRACE_ID = '1vapigw-camara-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    let headers_invalid_auth = {
      [TRACE_ID_HEADER]: TRACE_ID,
      Authorization: 'Basic INVALID',
    };

    let headers_with_auth = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    let headers_with_auth_and_quota = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };
    const ping_ratelimit =
      '1000, 1000;w=1;name="crd|api^camara-ping|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-camara-api.camara-ping"';
    const callback_ratelimit =
      '1000, 1000;w=1;name="crd|api^camara-callbacks|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-camara-api.camara-callbacks"';
    const enablement_ratelimit =
      '10, 10;w=1;name="crd|account_id|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-camara-api.enablement-api"';
    const location_retrieval_ratelimit =
      '10, 10;w=1;name="crd|account_id|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-camara-api.location-retrieval-api"';
    const protection_ratelimit = '10, 10;w=1;name="crd|account_id|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-camara-api.camara-api"';
    const hateoas404 = path =>
      `{"message":"Not Found","_links":{"self":[{"href":"${path}","templated":false}]},"_embedded":{"errors":[{"message":"Page Not Found"}]}}`;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      has_quota_authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers_with_auth['Authorization'] = authorization;
      headers_with_auth_and_quota['Authorization'] = has_quota_authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(camaraDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
          headers_invalid_auth['Host'] = domain;
          headers_with_auth['Host'] = domain;
          headers_with_auth_and_quota['Host'] = domain;
        });

        describe.each(['/camara/ping'])('%s', path => {
          test(`GET ${path} - valid ping - Should return 200 and proper rate limiting header`, async () => {
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(ping_ratelimit);
          });
        });

        describe.each(['/v1/gnp-adapter/callbacks/qod/0.8.1?webhook_url=test'])('%s', path => {
          test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.post(path).set(headers_invalid_auth);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text.includes('Missing Auth'));
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v1/gnp-adapter/callbacks/qod/0.8.1?webhook_url=test'])('%s', path => {
          test(`POST ${path} - valid request with zero quota - Should return 400 from upstream`, async () => {
            const response = await request.post(path).set(headers_with_auth).send('{}');
            expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            expect(response.text.includes('"title":"Unprocessable Entity"'));
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(callback_ratelimit);
          });
        });

        describe.each(['/v1/gnp-adapter/callbacks/qod/0.8.1?webhook_url=test'])('%s', path => {
          test(`GET ${path} - invalid request due to invalid method - Should return 405 from upstream`, async () => {
            const response = await request.get(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text.includes('"message":"Method Not Allowed"'));
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v0.1/network-enablement'])('%s', path => {
          test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.post(path).set(headers_invalid_auth);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text.includes('Missing Auth'));
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v0.1/network-enablement'])('%s', path => {
          test(`POST ${path} - valid request with zero quota - Should return 422 from upstream`, async () => {
            const response = await request.post(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            expect(response.text.includes('"title":"Unprocessable Entity"'));
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(enablement_ratelimit);
          });
        });

        describe.each(['/v0.1/network-enablement'])('%s', path => {
          test(`GET ${path} - invalid request due to invalid method - Should return 405 from upstream`, async () => {
            const response = await request.get(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text.includes('"message":"Method Not Allowed"'));
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v0.1/location/retrieval'])('%s', path => {
          test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.post(path).set(headers_invalid_auth);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text.includes('Missing Auth'));
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v0.1/location/retrieval'])('%s', path => {
          test(`POST ${path} - valid request with zero quota - Should return 422 from upstream`, async () => {
            const response = await request.post(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            expect(response.text.includes('"title":"Unprocessable Entity"'));
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(location_retrieval_ratelimit);
          });
        });

        describe.each(['/v0.1/location/retrieval'])('%s', path => {
          test(`GET ${path} - invalid request due to invalid method - Should return 405 from upstream`, async () => {
            const response = await request.get(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text.includes('"message":"Method Not Allowed"'));
            validateResponseHeaders(response.header);
          });
        });

        //####### AUTH TESTS #######

        //         describe.each(['/qod/v0.1'])('%s', path => {
        //           test(`GET ${path} - valid request - Should return 404 from the upstream and proper rate limiting header`, async () => {
        //             const response = await request.get(path).set(headers_with_auth_and_quota);
        //             expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        //             expect(response.text).toEqual(hateoas404(path));
        //             validateResponseHeaders(response.header);
        //             expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1'])('%s', path => {
        //           test(`POST ${path} - valid request - Should return 404 from the upstream and proper rate limiting header`, async () => {
        //             const response = await request.post(path).set(headers_with_auth_and_quota);
        //             expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        //             expect(response.text).toEqual(hateoas404(path));
        //             validateResponseHeaders(response.header);
        //             expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1'])('%s', path => {
        //           test(`DELETE ${path} - valid request - Should return 404 from the upstream and proper rate limiting header`, async () => {
        //             const response = await request.delete(path).set(headers_with_auth_and_quota);
        //             expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        //             expect(response.text).toEqual(hateoas404(path));
        //             validateResponseHeaders(response.header);
        //             expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1'])('%s', path => {
        //           test(`GET ${path} - invalid request due to no quota - Should return 401`, async () => {
        //             const response = await request.get(path).set(headers_with_auth);
        //             expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        //             validateResponseHeaders(response.header);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1'])('%s', path => {
        //           test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
        //             const response = await request.post(path).set(headers);
        //             expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        //             expect(response.text.includes('Missing Auth'));
        //             validateResponseHeaders(response.header);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
        //           test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
        //             const response = await request.post(path).set(headers);
        //             expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        //             expect(response.text.includes('Missing Auth'));
        //             validateResponseHeaders(response.header);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
        //           test(`POST ${path} - valid request with enough quota - Should return 400 from upstream`, async () => {
        //             const response = await request.post(path).set(headers_with_auth_and_quota);
        //             expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        //             expect(response.text.includes('"message":"Bad Request"'));
        //             validateResponseHeaders(response.header);
        //             expect(response.header['x-ratelimit-limit']).toEqual(callback_ratelimit);
        //           });
        //         });
        //
        //         describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
        //           test(`POST ${path} - valid request with zero quota - Should return 400 from upstream`, async () => {
        //             const response = await request.post(path).set(headers_with_auth);
        //             expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        //             expect(response.text.includes('"message":"Bad Request"'));
        //             validateResponseHeaders(response.header);
        //             expect(response.header['x-ratelimit-limit']).toEqual(callback_ratelimit);
        //           });
        //         });
        //
        //         // here since method is invalid for callback endpoint, request gets matched by prefix for /qod/v0.1 and
        //         // we receive error message from the upstream itself
        //         describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
        //           test(`GET ${path} - invalid request due to invalid method - Should return 405 from upstream`, async () => {
        //             const response = await request.get(path).set(headers_with_auth_and_quota);
        //             expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
        //             expect(response.text.includes('"message":"Method Not Allowed"'));
        //             validateResponseHeaders(response.header);
        //             expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
        //           });
        //         });
      });
    });
  });
});
