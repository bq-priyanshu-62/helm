import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import qs from 'querystring';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service conversions
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel active:irt-alert passive:irt-alerts-icinga
 */

const service = 'conversions';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('HEAD /conversions/ping - Should return 200', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '9a508b01716601C3',
          };
          const path = `/conversions/ping?` + qs.stringify(params);
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /conversions/ping - Should return 200', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '9a508b01716601C3',
          };
          const path = `/conversions/ping?` + qs.stringify(params);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /conversions/ping - Should return 403', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '9a508b01716601C3',
          };
          const path = `/conversions/ping?` + qs.stringify(params);
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('GET /conversions/ping-nonsense - wrong url - Should return 404', async () => {
          const path = `/conversions/ping-nonsense`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual(envoy404);
          validateResponseHeaders(response.header);
        });

        test('HEAD /conversions/submit - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/submit?` + qs.stringify(params);
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('GET /conversions/submit - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/submit?` + qs.stringify(params);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('POST /conversions/submit - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/submit?` + qs.stringify(params);
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('PUT /conversions/submit - Should return 403', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/submit?` + qs.stringify(params);
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('HEAD /conversions/sms - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/sms?` + qs.stringify(params);
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('GET /conversions/sms - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/sms?` + qs.stringify(params);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('POST /conversions/sms - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/sms?` + qs.stringify(params);
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('PUT /conversions/sms - Should return 403', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/sms?` + qs.stringify(params);
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        test('HEAD /conversions/voice - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/voice?` + qs.stringify(params);
          const response = await request.head(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('GET /conversions/voice - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/voice?` + qs.stringify(params);
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('POST /conversions/voice - Should return 401', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/voice?` + qs.stringify(params);
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(401);
          validateResponseHeaders(response.header);
        });

        test('PUT /conversions/voice - Should return 403', async () => {
          const params = {
            api_key: 'telco-conversions',
            api_secret: '',
          };
          const path = `/conversions/voice?` + qs.stringify(params);
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
