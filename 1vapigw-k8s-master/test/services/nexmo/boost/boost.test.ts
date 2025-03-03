import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service boost
 * @lob api
 * @prod euc1 euw1
 * @dev euw1
 * @prodNotifyChannel vna-alerts
 */

const service = 'boost';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Vonage Boost', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const boostDomain = getHostDomainsList(servicesConf.api.boost[selectedRegion]);
    let authorization;
    let has_quota_authorization;
    const TRACE_ID = '1vapigw-boost-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    let headers_with_auth = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    const headers_with_auth_and_quota = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };
    const ping_ratelimit = '1000, 1000;w=1;name="crd|api^boost-ping|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-boost.boost-ping"';
    const callback_ratelimit =
      '1000, 1000;w=1;name="crd|api^boost-callbacks|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-boost.boost-callbacks"';
    const protection_ratelimit = '10, 10;w=1;name="crd|account_id|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-boost.boost-api"';

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api.authorization);
      has_quota_authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      request = defaultRequest(host);
      headers_with_auth_and_quota['Authorization'] = has_quota_authorization;
      headers_with_auth['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(boostDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
          headers_with_auth['Host'] = domain;
          headers_with_auth_and_quota['Host'] = domain;
        });

        describe.each(['/qod/v0.1/ping'])('%s', path => {
          test(`GET ${path} - valid ping - Should return 200 and proper rate limiting header`, async () => {
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(ping_ratelimit);
          });
        });

        //####### AUTH TESTS #######

        describe.each(['/qod/v0.1'])('%s', path => {
          test(`GET ${path} - valid request - Should return 404 from the upstream and proper rate limiting header`, async () => {
            const response = await request.get(path).set(headers_with_auth_and_quota);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toContain('"detail":"The requested endpoint does not exist"');
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
          });
        });

        describe.each(['/qod/v0.1'])('%s', path => {
          test(`POST ${path} - valid request - Should return 404 from the upstream and proper rate limiting header`, async () => {
            const response = await request.post(path).set(headers_with_auth_and_quota);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toContain('"detail":"The requested endpoint does not exist"');
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
          });
        });

        describe.each(['/qod/v0.1'])('%s', path => {
          test(`DELETE ${path} - valid request - Should return 404 from the upstream and proper rate limiting header`, async () => {
            const response = await request.delete(path).set(headers_with_auth_and_quota);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toContain('"detail":"The requested endpoint does not exist"');
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
          });
        });

        describe.each(['/qod/v0.1'])('%s', path => {
          test(`GET ${path} - invalid request due to no quota - Should return 401`, async () => {
            const response = await request.get(path).set(headers_with_auth);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/qod/v0.1'])('%s', path => {
          test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toContain('Missing Auth');
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
          test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text).toContain('Missing Auth');
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
          test(`POST ${path} - valid request with enough quota - Should return 422 from upstream`, async () => {
            const response = await request.post(path).set(headers_with_auth_and_quota);
            expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            expect(response.text).toContain('"title":"Missing \'application-id\' query parameter"');
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(callback_ratelimit);
          });
        });

        describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
          test(`POST ${path} - valid request with zero quota - Should return 422 from upstream`, async () => {
            const response = await request.post(path).set(headers_with_auth);
            expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            expect(response.text).toContain('"title":"Missing \'application-id\' query parameter"');
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(callback_ratelimit);
          });
        });

        // TODO: uncomment back when GNPTEAM3-26 is resolved
        // here since method is invalid for callback endpoint, request gets matched by prefix for /qod/v0.1 and
        // we receive error message from the upstream itself
        // describe.each(['/qod/v0.1/sessions/9ba7fe85-255a-4b72-b054-1e6bfb3b4726/status-updates'])('%s', path => {
        //   test(`GET ${path} - invalid request due to invalid method - Should return 405 from upstream`, async () => {
        //     const response = await request.get(path).set(headers_with_auth_and_quota);
        //     expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
        //     expect(response.text.includes('"message":"Method Not Allowed"'));
        //     validateResponseHeaders(response.header);
        //     expect(response.header['x-ratelimit-limit']).toEqual(protection_ratelimit);
        //   });
        // });
      });
    });
  });
});
