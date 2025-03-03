import { getHostList, servicesConf } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { defaultWSRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service sanity_ws
 * @lob nexmo
 * @qa euc1 euw1 use1
 * @dev euw1 use1
 * @prodNotifyChannel api-gw-notify
 */

const service = 'sanity_ws';

describe(`Nexmo ${service}`, () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let authorization;

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api.hasQuotaAuthorization);
    });

    test('WSS /gateway/ws - no auth send message', async () => {
      const path = `/gateway/ws`;
      const message = 'test-sanity-message-no-auth';
      const { wss, messages } = await defaultWSRequest(host, path);
      wss.send(message);
      await new Promise(r => setTimeout(r, 2000));
      expect(messages[0]?.data).toEqual(message);
    });

    test('WSS /gateway/ws-protected - no auth send message', async () => {
      const path = `/gateway/ws-protected`;
      const message = 'test-sanity-message-no-auth';
      const { wss, messages, errors } = await defaultWSRequest(host, path);
      expect(errors[0]).toEqual(new Error('Unexpected server response: 422'));
      wss.send(message);
      await new Promise(r => setTimeout(r, 2000));
      expect(messages.length).toEqual(0);
    });

    test('WSS /gateway/ws-protected - auth send message', async () => {
      const path = `/gateway/ws-protected`;
      const message = 'test-sanity-message';
      const headers = {
        Authorization: authorization,
      };
      const { wss, messages } = await defaultWSRequest(host, path, headers);
      wss.send(message);
      await new Promise(r => setTimeout(r, 2000));
      expect(messages[0]?.data).toEqual(message);
    });
  });
});
