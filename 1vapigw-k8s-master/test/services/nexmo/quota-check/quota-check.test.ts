import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { getSecret } from '../../../utils/get-secret';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service quota_check
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 apse3 mec1 use1 usw2
 * @qa euw1 // euc1 apse1 apse2 use1 usw2 //Note that quota isn't in sync outside of euw1 in qa. The quota team is working on it.
 * @dev euw1 use1
 * @prodNotifyChannel api-gw-notify
 */

const service = 'quotaCheck';

function validateResponseHeaders(header) {
  //   expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const quotaCheckDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);

    let api_key;
    let api_secret;
    let noQuotaAuth;
    let noQuotaApiKey;
    let noQuotaApiSecret;
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api[service].withQuotaAuthorization);
      noQuotaApiKey = await getSecret(servicesConf.api[service].noQuotaApiKey);
      api_key = await getSecret(servicesConf.api[service].withQuotaAccount);
      api_secret = await getSecret(servicesConf.api[service].withQuotaPassword);
      noQuotaAuth = await getSecret(servicesConf.api[service].noQuotaAuth);
      noQuotaApiSecret = await getSecret(servicesConf.api[service].noQuotaApiSecret);
    });

    describe(`${service} Services`, () => {
      describe.each(quotaCheckDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
        };

        test('get /ping-protected-withquota - Should return 401', async () => {
          const path = `/ping-protected-withquota`;
          headers['Authorization'] = noQuotaAuth;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toContain('Quota Exceeded - rejected');
          validateResponseHeaders(response.header);
        });

        test('get /ping-protected-withquota with invalid credentials - Should return 401', async () => {
          const path = `/ping-protected-withquota`;
          headers['Authorization'] = 'Basic ' + Buffer.from(noQuotaApiKey + ':invalid').toString('base64');
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).not.toContain('Quota Exceeded');
          expect(response.text).toContain('You did not provide correct credentials.');
          validateResponseHeaders(response.header);
        });

        test('get /ping-protected-withquota - Should return 200', async () => {
          const path = `/ping-protected-withquota`;
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('get /ping-protected-noquota - Should return 200', async () => {
          const path = `/ping-protected-noquota`;
          headers['Authorization'] = noQuotaAuth;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('post /ping-protected-withquota-body - Should return 401', async () => {
          const path = `/ping-protected-withquota-body`;
          const payload = {
            api_key: noQuotaApiKey,
            api_secret: noQuotaApiSecret,
          };
          const response = await request.post(path).send(payload);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toContain('Quota Exceeded - rejected');
          validateResponseHeaders(response.header);
        });

        test('post /ping-protected-withquota-body - Should return 200', async () => {
          const path = `/ping-protected-withquota-body`;
          const payload = {
            api_key: api_key,
            api_secret: api_secret,
          };
          const response = await request.post(path).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('post /ping-protected-noquota-body - Should return 200', async () => {
          const path = `/ping-protected-noquota-body`;
          const payload = {
            api_key: noQuotaApiKey,
            api_secret: noQuotaApiSecret,
          };
          const response = await request.post(path).send(payload);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
