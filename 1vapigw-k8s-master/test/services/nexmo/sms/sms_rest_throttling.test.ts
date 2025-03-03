import { getHostDomainsList, getHostList, selectedRegion, servicesConf } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service sms_rest_throttling
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel active:telco-alert passive:telco-alerts-icinga
 */

function validateResponseHeaders(header) {
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

const path = `/sms/throttling`;

function getHeaders(hostHeaderValue: string, traceSuffix: string) {
  return {
    Host: hostHeaderValue,
    [TRACE_ID_HEADER]: `1vapigw-sms-smpp-throttling-tests-${traceSuffix}`,
  };
}

describe(' Nexmo SMS Throttling ', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    const hostHeaderValues = getHostDomainsList(servicesConf.api.sms_rest_throttling[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe.each(hostHeaderValues)('host header - %s', hostHeader => {
      test(`GET - Should return 200`, async () => {
        let account = await getSecret(servicesConf.api.testAccount);
        let pass = await getSecret(servicesConf.api.testPassword);

        const response = await request.get(path).set(getHeaders(hostHeader, 'get200')).query({ api_key: account, api_secret: pass });

        expect(response.status).toEqual(StatusCodes.OK);
        validateResponseHeaders(response.header);
      });

      test('POST - Should return 404', async () => {
        const response = await request.post(path).set(getHeaders(hostHeader, 'post404'));

        expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        expect(response.text).toEqual(envoy404);
        validateResponseHeaders(response.header);
      });

      test('PUT - Should return 404', async () => {
        const response = await request.put(path).set(getHeaders(hostHeader, 'put404'));

        expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        expect(response.text).toEqual(envoy404);
        validateResponseHeaders(response.header);
      });

      test('GET - No Auth - Should return 422', async () => {
        const response = await request.get(path).set(getHeaders(hostHeader, 'badAuth422'));

        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        validateResponseHeaders(response.header);
      });

      test('GET - Bad Auth - Should return 401', async () => {
        const response = await request.get(path).set(getHeaders(hostHeader, 'noAuth401')).query({ api_key: 'meep', api_secret: 'morp' });

        expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        validateResponseHeaders(response.header);
      });
    });
  });
});
