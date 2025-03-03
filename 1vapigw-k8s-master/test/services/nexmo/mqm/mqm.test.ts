import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service mqm
 * @lob api
 * @prod euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel telco-alert
 */

const service = 'mqm';

function validateResponseHeaders(header) {
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Vonage MQM VTC', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const mqmDomain = getHostDomainsList(servicesConf.api.mqm[selectedRegion]);
    const rateLimitPerSecond = servicesConf.api.mqm.rateLimitPerSecond;
    let authorization;
    const TRACE_ID = '1vapigw-vtc-test';

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

    const expectedUnauthorizedResponse = {
      type: 'https://developer.vonage.com/en/api-errors#unauthorized',
      title: 'You did not provide correct credentials.',
      detail: 'Check your authentication credentials are correct, you can find these credentials in the Vonage Dashboard',
    };

    const expectedThrottledResponse = {
      type: 'https://developer.vonage.com/en/api-errors/traffic-control#throttled',
      title: 'Request Throttled',
      detail: 'Your request rate exceeds the allowed limit for this account.',
    };

    const ping_ratelimit =
      '1000, 1000;w=1;name="crd|api^mqm-ping|generic_key^nexmo-messaging-queue-metrics.mqm-ping|generic_key^solo.setDescriptor.uniqueValue"';
    const current_queue_size_ratelimit =
      '1, 1;w=1;name="crd|account_id|generic_key^nexmo-messaging-queue-metrics.mqm-vtc|generic_key^solo.setDescriptor.uniqueValue"';

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers_with_auth['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(mqmDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
          headers_invalid_auth['Host'] = domain;
          headers_with_auth['Host'] = domain;
        });

        describe.each(['/vtc/ping'])('%s', path => {
          test(`GET ${path} - valid ping - Should return 200 and proper rate limiting header`, async () => {
            const response = await request.get(path).set(headers_invalid_auth);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(ping_ratelimit);
          });
        });

        describe.each(['/v0.1/vtc/queues/product/sms/current'])('%s', path => {
          test(`GET ${path} - send request with valid auth - Should return 200 - OK`, async () => {
            const response = await retryFor429(request.get(path).set(headers_with_auth));
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(current_queue_size_ratelimit);
          });
        });

        describe.each(['/v0.1/vtc/queues/product/sms/current'])('%s', path => {
          test(`GET ${path} - send requests more than defined rate limit with valid auth - Should return 429 - TOO_MANY_REQUESTS`, async () => {
            let responses: any = [];
            for (let i = 0; i < rateLimitPerSecond + 5; i++) {
              responses.push(request.get(path).set(headers_with_auth));
            }
            responses = (await Promise.all(responses)).filter(x => x.status === StatusCodes.TOO_MANY_REQUESTS);
            expect(responses.length).toBeGreaterThan(0);
            expect(responses[0].body).toMatchObject(expectedThrottledResponse);
          });
        });

        describe.each(['/v0.1/vtc/queues/product/sms/current'])('%s', path => {
          test(`GET ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.get(path).set(headers_invalid_auth);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.body).toMatchObject(expectedUnauthorizedResponse);
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v0.1/vtc/queues/product/sms/current'])('%s', path => {
          test(`POST ${path} - invalid request due to invalid method - Should return 403`, async () => {
            const response = await request.post(path).set(headers_with_auth).send('{}');
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            validateResponseHeaders(response.header);
          });
        });
      });
    });
  });
});
