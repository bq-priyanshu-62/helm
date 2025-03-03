import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service number-insight
 * @lob api
 * @prod euc1 euw1
 * @dev euw1
 * @prodNotifyChannel vna-alerts
 */

const service = 'number-insight';

function validateResponseHeaders(header) {
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Vonage VNA Number Insights', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const numberInsightDomain = getHostDomainsList(servicesConf.api.numberInsight[selectedRegion]);
    let authorization;
    let has_quota_authorization;
    const TRACE_ID = '1vapigw-number-insight-test';
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
    const number_insight_ratelimit =
      '30, 30;w=1;name="crd|account_id|generic_key^solo.setDescriptor.uniqueValue|generic_key^vcp-number-insight.number-insight"';

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      has_quota_authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers_with_auth['Authorization'] = authorization;
      headers_with_auth_and_quota['Authorization'] = has_quota_authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(numberInsightDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
          headers_invalid_auth['Host'] = domain;
          headers_with_auth['Host'] = domain;
          headers_with_auth_and_quota['Host'] = domain;
        });

        describe.each(['/v3.0/insights'])('%s', path => {
          test(`POST ${path} - invalid request due to no auth - Should return 401 - Missing Auth`, async () => {
            const response = await request.post(path).set(headers_invalid_auth);
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.text.includes('Missing Auth'));
            validateResponseHeaders(response.header);
          });
        });

        describe.each(['/v3.0/insights'])('%s', path => {
          test(`POST ${path} - valid request with zero quota - Should return 422 from upstream`, async () => {
            const response = await request.post(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            expect(response.text.includes('"title":"Unprocessable Entity"'));
            validateResponseHeaders(response.header);
            expect(response.header['x-ratelimit-limit']).toEqual(number_insight_ratelimit);
          });
        });

        describe.each(['/v3.0/insights'])('%s', path => {
          test(`GET ${path} - invalid request due to invalid method - Should return 405 from upstream`, async () => {
            const response = await request.get(path).set(headers_with_auth_and_quota).send('{}');
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text.includes('"message":"Method Not Allowed"'));
            validateResponseHeaders(response.header);
          });
        });
      });
    });
  });
});
