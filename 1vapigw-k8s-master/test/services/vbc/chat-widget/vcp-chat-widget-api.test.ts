import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

/**
 * @service chat widget
 * @lob nexmo
 * @dev use1
 * @qa use1
 * @prod use1 usw2 euw1 euc1
 * @notifyChannel chat-widget-gateway-notifications-dev-qa
 * @prodNotifyChannel chat-widget-gateway-notifications-prod
 */
const service = 'chat-widget';

describe('CHAT-WIDGET', () => {
  describe.each(getHostList(LobTypes.API, 'chat-widget'))('Sanity - %s', host => {
    let request;
    let headers = {};

    const chatDomain = getHostDomainsList(servicesConf.api['chat-widget'][selectedRegion]);
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(chatDomain)('domain- %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('POST /chat-widget/widget - Should return 401 From CHAT WIDGET', async () => {
          const path = '/chat-widget/widget';

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('');
        });

        test('GET /chat-widget/widget - invalid credentials - Should return 422 From GW', async () => {
          const path = '/chat-widget/widget';

          const noAuth_headers = {
            Host: domain,
          };
          const response = await request.get(path).set(noAuth_headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);

          const body = JSON.parse(response.text);
          expect(body.detail).toEqual('Auth header is required');
        });
      });
    });
  });
});
