import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { v4 as uuidv4 } from 'uuid';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service verify-v2-provisioning
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2
 * @dev euw1
 * @prodNotifyChannel api-verify-alerts
 */

const service = 'verify-v2-provisioning';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
  expect(header).not.toHaveProperty('x-identity-error-code');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const verifyV2ProvisioningDomain = getHostDomainsList(servicesConf.api.verify_v2_provisioning[selectedRegion]);
    let authorizationNoQuota;
    let authorization;

    const TRACE_ID = '1vapigw-verify-v2-provisioning-test-' + uuidv4();
    let headers = {
      [TRACE_ID_HEADER]: TRACE_ID,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorizationNoQuota = await getSecret(servicesConf.api.authorization);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    describe(`${service} Services`, () => {
      describe.each(verifyV2ProvisioningDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        const path = `/v2/verify/templates`;

        test('PUT /v2/verify/templates - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/templates - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/verify/templates - Should return 405', async () => {
          headers['Authorization'] = authorization;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/verify/templates - Should return 405', async () => {
          headers['Authorization'] = authorization;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/templates - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/templates - No Quota - Should return 401', async () => {
          headers['Authorization'] = authorizationNoQuota;

          const response = await request.post(path).set(headers);
          const expectedResponse = {
            detail: 'Quota Exceeded - rejected',
            instance: TRACE_ID,
            title: 'Quota Exceeded',
            type: 'https://developer.nexmo.com/api-errors#quota-exceeded',
          };

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates - Should return 200', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });
      });
    });

    describe(`${service} Services`, () => {
      describe.each(verifyV2ProvisioningDomain)('domain - %s', domain => {
        headers['Host'] = domain;
        const path = `/v2/verify/templates/123`;

        test('POST /v2/verify/templates/123 - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/templates/123 - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('404 page not found');
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates/123 - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates/123 - Should return 422 with invalid params', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Template ID');
          expect(response.text).toContain('Value must be an UUID');
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/verify/templates/123 - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/verify/templates/123 - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.patch(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/verify/templates/123 - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });

    describe(`${service} Services`, () => {
      describe.each(verifyV2ProvisioningDomain)('domain - %s', domain => {
        headers['Host'] = domain;
        const path = `/v2/verify/templates/123/template_fragments`;

        test('POST /v2/verify/templates/123/template_fragments - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/templates/123/template_fragments - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates/123/template_fragments - Should return 422 with invalid params', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Template ID');
          expect(response.text).toContain('Value must be an UUID');
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates/123/template_fragments - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/verify/templates/123/template_fragments - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });

    describe(`${service} Services`, () => {
      describe.each(verifyV2ProvisioningDomain)('domain - %s', domain => {
        headers['Host'] = domain;
        const path = `/v2/verify/templates/123/template_fragments/xyz`;

        test('GET /v2/verify/templates/123/template_fragments/xyz - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/templates/123/template_fragments/xyz - Should return 422 with invalid params', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
          expect(response.text).toContain('Template ID');
          expect(response.text).toContain('Value must be an UUID');
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/verify/templates/123/template_fragments/xyz - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.patch(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('PATCH /v2/verify/templates/123/template_fragments/xyz - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.patch(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/verify/templates/123/template_fragments/xyz - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.delete(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/verify/templates/123/template_fragments/xyz - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/verify/templates/123/template_fragments/xyz - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });

    describe(`${service} Services`, () => {
      describe.each(verifyV2ProvisioningDomain)('domain - %s', domain => {
        headers['Host'] = domain;
        const path = `/v2/verify/template_variables`;

        test('GET /v2/verify/template_variables - Should return 200', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/template_variables - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/template_variables - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.post(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/template_variables - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/verify/template_variables - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });

    describe(`${service} Services`, () => {
      describe.each(verifyV2ProvisioningDomain)('domain - %s', domain => {
        headers['Host'] = domain;
        const path = `/v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8`;

        test('GET /v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8 - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.get(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('GET /v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8 - Should return 404', async () => {
          headers['Authorization'] = authorization;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('Template variable 568aa757-9bad-43fc-a187-a3f43ccd8fb8 was not found');
          validateResponseHeaders(response.header);
        });

        test('POST /v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8 - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain('404 page not found');
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8 - Wrong Authorization - Should return 401', async () => {
          headers['Authorization'] = 'Basic invalid';
          const response = await request.delete(path).set(headers);
          const expectedResponse = {
            title: 'Unauthorized',
            type: 'https://developer.nexmo.com/api-errors#unauthorized',
          };
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body).toMatchObject(expectedResponse);
          validateResponseHeaders(response.header);
        });

        test('DELETE /v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8 - Should return 403', async () => {
          headers['Authorization'] = authorization;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toContain('Templates management is not enabled for your account');
          validateResponseHeaders(response.header);
        });

        test('PUT /v2/verify/template_variables/568aa757-9bad-43fc-a187-a3f43ccd8fb8 - Method Unsupported - Should return upstream 404 with message not found', async () => {
          headers['Authorization'] = authorization;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toContain(envoy404);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
