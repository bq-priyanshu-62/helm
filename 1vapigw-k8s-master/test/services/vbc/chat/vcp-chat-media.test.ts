import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

/**
 * @service chat-media
 * @lob nexmo
 * @dev use1
 * @qa use1
 * @prod use1 usw2 euw1 euc1
 * @notifyChannel chat-api-gateway-notifications-qa
 * @prodNotifyChannel chat-api-gateway-notifications-prod
 */
const service = 'chat-media';

describe('CHAT-MEDIA', () => {
  describe.each(getHostList(LobTypes.API, 'chat-media'))('Sanity - %s', host => {
    let request;
    let headers = {};

    const chatDomain = getHostDomainsList(servicesConf.api.chat[selectedRegion]);
    let authorization;

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(chatDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /chat-media/1/messages/1111/attachments - Should return 401 From CHAT MEDIA', async () => {
          const path = '/chat-media/1/messages/1111/attachments';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('');
        });

        test('GET /chat-media/1/messages/1111/attachments - invalid credentials - Should return 422 From GW', async () => {
          const path = '/chat-media/1/messages/1111/attachments';

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
