import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

/**
 * @service chat widget
 * @lob nexmo
 * @dev use1
 * @qa use1
 * @prod use1 usw2 euc1 euw1
 * @notifyChannel chat-widget-gateway-notifications-dev-qa
 * @prodNotifyChannel chat-widget-gateway-notifications-prod
 */
const service = 'chat-widget';

describe('CHAT-GUEST', () => {
  describe.each(getHostList(LobTypes.API, 'chat-guest'))('Sanity - %s', host => {
    let request;
    const chatDomain = getHostDomainsList(servicesConf.api['chat-guest'][selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(chatDomain)('domain - %s', domain => {
        const headers = {
          Host: domain,
        };

        test('POST /chat-guest/session - Non-existing widget-id should return 404', async () => {
          const path = '/chat-guest/session';
          const payload = {
            widget_id: 'notFound',
          };

          const response = await request.post(path).set(headers).send(payload);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.text).toEqual('{"message":"Failed to find chat widget: notFound"}');
        });

        test('POST /chat-guest/widget - Should return 401 From GW', async () => {
          const path = '/chat-guest/widget';

          const response = await request.post(path).set(headers).send({});
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('');
        });
      });
    });
  });
});
