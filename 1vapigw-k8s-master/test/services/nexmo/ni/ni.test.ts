import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service ni
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel oss-alerts
 */

const service = 'ni';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const niDomain = getHostDomainsList(servicesConf.api.ni[selectedRegion]);
    let authorization;
    const TRACE_ID = '1vapigw-ni-test';
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(niDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /ni/ping - Should return 200', async () => {
          const path = `/ni/ping`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('POST /ni/ping - Should return 403', async () => {
          const path = `/ni/ping`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /ni - wrong url - Should return 404', async () => {
          const path = `/ni`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        //########

        // test('GET /number/lookup/json - Should return 200', async () => {
        //   const path = `/number/lookup/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /number/lookup/json - Should return 200', async () => {
        //   const path = `/number/lookup/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /number/lookup/json - Should return 200', async () => {
        //   const path = `/number/lookup/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /number/lookup/json - Should return 403', async () => {
        //   const path = `/number/lookup/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /number/lookup/xml - Should return 200', async () => {
        //   const path = `/number/lookup/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /number/lookup/xml - Should return 200', async () => {
        //   const path = `/number/lookup/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /number/lookup/xml - Should return 200', async () => {
        //   const path = `/number/lookup/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /number/lookup/xml - Should return 403', async () => {
        //   const path = `/number/lookup/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        //########

        // test('GET /number/format/json - Should return 200', async () => {
        //   const path = `/number/format/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /number/format/json - Should return 200', async () => {
        //   const path = `/number/format/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /number/format/json - Should return 200', async () => {
        //   const path = `/number/format/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /number/format/json - Should return 403', async () => {
        //   const path = `/number/format/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /number/format/xml - Should return 200', async () => {
        //   const path = `/number/format/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /number/format/xml - Should return 200', async () => {
        //   const path = `/number/format/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /number/format/xml - Should return 200', async () => {
        //   const path = `/number/format/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /number/format/xml - Should return 403', async () => {
        //   const path = `/number/format/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        //########

        // test('GET /number/insight/json - Should return 200', async () => {
        //   const path = `/number/insight/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /number/insight/json - Should return 200', async () => {
        //   const path = `/number/insight/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /number/insight/json - Should return 200', async () => {
        //   const path = `/number/insight/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /number/insight/json - Should return 403', async () => {
        //   const path = `/number/insight/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /number/insight/xml - Should return 200', async () => {
        //   const path = `/number/insight/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /number/insight/xml - Should return 200', async () => {
        //   const path = `/number/insight/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /number/insight/xml - Should return 200', async () => {
        //   const path = `/number/insight/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /number/insight/xml - Should return 403', async () => {
        //   const path = `/number/insight/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        //########

        // test('GET /ni/basic/json - Should return 200', async () => {
        //   const path = `/ni/basic/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/basic/json - Should return 200', async () => {
        //   const path = `/ni/basic/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/basic/json - Should return 200', async () => {
        //   const path = `/ni/basic/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/basic/json - Should return 403', async () => {
        //   const path = `/ni/basic/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /ni/basic/xml - Should return 200', async () => {
        //   const path = `/ni/basic/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/basic/xml - Should return 200', async () => {
        //   const path = `/ni/basic/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/basic/xml - Should return 200', async () => {
        //   const path = `/ni/basic/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/basic/xml - Should return 403', async () => {
        //   const path = `/ni/basic/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        //########

        // test('GET /ni/standard/json - Should return 200', async () => {
        //   const path = `/ni/standard/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/standard/json - Should return 200', async () => {
        //   const path = `/ni/standard/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/standard/json - Should return 200', async () => {
        //   const path = `/ni/standard/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/standard/json - Should return 403', async () => {
        //   const path = `/ni/standard/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /ni/standard/xml - Should return 200', async () => {
        //   const path = `/ni/standard/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/standard/xml - Should return 200', async () => {
        //   const path = `/ni/standard/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/standard/xml - Should return 200', async () => {
        //   const path = `/ni/standard/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/standard/xml - Should return 403', async () => {
        //   const path = `/ni/standard/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        //########

        // test('GET /ni/advanced/json - Should return 200', async () => {
        //   const path = `/ni/advanced/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/advanced/json - Should return 200', async () => {
        //   const path = `/ni/advanced/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/advanced/json - Should return 200', async () => {
        //   const path = `/ni/advanced/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/advanced/json - Should return 403', async () => {
        //   const path = `/ni/advanced/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /ni/advanced/xml - Should return 200', async () => {
        //   const path = `/ni/advanced/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/advanced/xml - Should return 200', async () => {
        //   const path = `/ni/advanced/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/advanced/xml - Should return 200', async () => {
        //   const path = `/ni/advanced/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/advanced/xml - Should return 403', async () => {
        //   const path = `/ni/advanced/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        //########

        // test('GET /ni/advanced/async/json - Should return 200', async () => {
        //   const path = `/ni/advanced/async/json`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/advanced/async/json - Should return 200', async () => {
        //   const path = `/ni/advanced/async/json`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/advanced/async/json - Should return 200', async () => {
        //   const path = `/ni/advanced/async/json`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/advanced/async/json - Should return 403', async () => {
        //   const path = `/ni/advanced/async/json`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });

        // test('GET /ni/advanced/async/xml - Should return 200', async () => {
        //   const path = `/ni/advanced/async/xml`;
        //   const response = await request.get(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('POST /ni/advanced/async/xml - Should return 200', async () => {
        //   const path = `/ni/advanced/async/xml`;
        //   const response = await request.post(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   expect(response.text).toContain('Invalid credentials');
        //   validateResponseHeaders(response.header);
        // });

        // test('HEAD /ni/advanced/async/xml - Should return 200', async () => {
        //   const path = `/ni/advanced/async/xml`;
        //   const response = await request.head(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.OK);
        //   validateResponseHeaders(response.header);
        // });

        // test('PATCH /ni/advanced/async/xml - Should return 403', async () => {
        //   const path = `/ni/advanced/async/xml`;
        //   const response = await request.patch(path).set(headers);
        //   expect(response.status).toEqual(StatusCodes.FORBIDDEN);
        //   expect(response.text).toEqual(envoy403);
        //   validateResponseHeaders(response.header);
        // });
      });
    });
  });
});
