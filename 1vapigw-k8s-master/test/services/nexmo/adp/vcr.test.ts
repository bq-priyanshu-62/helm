import { getHostDomainsList, getHostList, selectedRegion, servicesConf } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultRequest } from '../../../utils/default-request';
import { StatusCodes } from 'http-status-codes';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { oidcCookie } from './oidcCookie';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service adp
 * @lob nexmo
 * @prod euw1
 * @qa euw1
 * @prodNotifyChannel api-dashboard-monitoring
 */

const SERVICE = 'adp';
const VCR = 'vcr';

describe('Nexmo', () => {
  const vcrDomains = getHostDomainsList(servicesConf[LobTypes.API][SERVICE][VCR]);

  const { authHost, secrets: vcrSecrets } = servicesConf[LobTypes.API][SERVICE][VCR];

  describe.each(getHostList(LobTypes.API))('ADP Sanity - ', host => {
    let request;
    const headers = {
      [TRACE_ID_HEADER]: `1vapigw-${SERVICE}-sanity-test`,
    };
    const authHeaders = {};

    beforeAll(async () => {
      request = defaultRequest(host);

      const apiKey = await getSecret(vcrSecrets.apiKey);
      const username = await getSecret(vcrSecrets.username);
      const captchaSkip = await getSecret(vcrSecrets.captchaSkip);
      const password = await getSecret(vcrSecrets.password);

      headers['x-neru-apiaccountid'] = apiKey;

      for (const domain of vcrDomains) {
        authHeaders[domain] = await oidcCookie({
          host: domain,
          authHost,
          username,
          captchaSkip,
          password,
        });
      }
    });

    describe(`${SERVICE} Services`, () => {
      describe.each(vcrDomains)('%s', domain => {
        headers['Host'] = domain;

        test('Marketplace API | GET /_health - Should return 200', async () => {
          const response = await request.get(`/neru/api/v1/${selectedRegion}/marketplace/_health`).set({ ...headers, ...authHeaders[domain] });

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('Marketplace API | POST /launch - Should return 400', async () => {
          const response = await request
            .post(`/neru/api/v1/${selectedRegion}/marketplace/workspaces/wsp-1234/launch`)
            .set({ ...headers, ...authHeaders[domain] });

          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toBe('workspaceID failed validation: must be a valid uuid4');
        });

        test('Marketplace API | POST /upload/source - Should return 400', async () => {
          const response = await request
            .post(`/neru/api/v1/${selectedRegion}/marketplace/products/prd-1234/versions/ver-1234/upload/source`)
            .set({ ...headers, ...authHeaders[domain] });

          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toBe('productID failed validation: must be a valid uuid4');
        });

        test('Code Server API | GET /cs - Should return 404', async () => {
          const response = await request.get(`/neru/api/v1/${selectedRegion}/cs/cs-1234/`).set({ ...headers, ...authHeaders[domain] });

          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
        });
      });
    });
  });
});
