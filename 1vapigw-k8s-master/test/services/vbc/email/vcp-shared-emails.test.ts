import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

/**
 * @service email
 * @lob nexmo
 * @dev use1
 * @qa use1
 * @prod use1 euc1 euw1
 */
const service = 'email';

describe('EMAIL', () => {
  describe.each(getHostList(LobTypes.API, 'email'))('Sanity - %s', host => {
    let request;
    let headers = {};
    let headersWithoutAuth = {};
    let headersWithQuotaAuth = {};

    const emailDomain = getHostDomainsList(servicesConf.api.chat[selectedRegion]);
    let authorization;
    let quotaAuthorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      quotaAuthorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers['Authorization'] = authorization;
      headersWithQuotaAuth['Authorization'] = quotaAuthorization;
    });

    describe(`${service} Services`, () => {
      describe.each(emailDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
          headersWithoutAuth['Host'] = domain;
          headersWithQuotaAuth['Host'] = domain;
        });

        test('Nonexistent route - Should return 404', async () => {
          const path = '/email/nothing';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });

        test('GET /email/healthy - Should return 200 From email service', async () => {
          const path = '/email/healthy';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /email/ready - Should return 200', async () => {
          const path = '/email/ready';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /email/auth/callback - Should return 400', async () => {
          const path = '/email/auth/callback';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        });

        test('GET /email/auth/complete - Should return 200', async () => {
          const path = '/email/auth/complete';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /email/auth/url - Should return 401', async () => {
          const path = '/email/auth/url';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /email/auth/url with no auth headers - Should return 422 with missing auth', async () => {
          const path = '/email/auth/url';

          const response = await request.get(path).set(headersWithoutAuth);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Missing Auth');
        });

        test('GET /email/auth/url with quota auth headers - Should return 400', async () => {
          const path = '/email/auth/url';

          const response = await request.get(path).set(headersWithQuotaAuth);
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        });

        test('POST /email/messages - Should return 401', async () => {
          const path = '/email/messages';

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('POST /email/messages with no auth headers - Should return 422 with missing auth', async () => {
          const path = '/email/messages';

          const response = await request.post(path).set(headersWithoutAuth);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Missing Auth');
        });

        test('POST /email/messages with quota auth headers - Should return 404', async () => {
          const path = '/email/messages';

          const response = await request.post(path).set(headersWithQuotaAuth);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });

        test('GET /email/messages/:messageId - Should return 401', async () => {
          const path = '/email/messages/123';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /email/messages/:messageId with no auth headers - Should return 422 with missing auth', async () => {
          const path = '/email/messages/123';

          const response = await request.get(path).set(headersWithoutAuth);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Missing Auth');
        });

        test('GET /email/messages/:messageId with quota auth headers - Should return 404', async () => {
          const path = '/email/messages/123';

          const response = await request.get(path).set(headersWithQuotaAuth);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });

        test('GET /email/grants/:grantId - Should return 401', async () => {
          const path = '/email/grants/123';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });

        test('GET /email/grants/:grantId with no auth headers - Should return 422 with missing auth', async () => {
          const path = '/email/grants/123';

          const response = await request.get(path).set(headersWithoutAuth);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Missing Auth');
        });

        test('GET /email/grants/:grantId with quota auth headers - Should return 404', async () => {
          const path = '/email/grants/123';

          const response = await request.get(path).set(headersWithQuotaAuth);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });
      });
    });
  });
});
