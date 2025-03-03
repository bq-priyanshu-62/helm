import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

import * as fs from 'fs';
import * as pathService from 'path';

// NOTE: this file is meant to test the 'chat-test' path, relevant only for DEV env.

/**
 * @service chat
 * @lob nexmo
 * @dev use1
 * @notifyChannel chat-api-gateway-notifications-qa
 * @prodNotifyChannel chat-api-gateway-notifications-prod
 */
const service = 'chat';

describe('CHAT-TEST', () => {
  describe.each(getHostList(LobTypes.API, 'chat'))('Sanity - %s', host => {
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

        test('GET /chat-test/1/interactions/111 - Should return 401 From CHAT API', async () => {
          const path = '/chat-test/1/interactions/111';

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('');
        });

        test('POST /chat-test/1/interactions/111/messages - Should return 401 From CHAT API, for more than 16kb payload', async () => {
          const fileContent = fs.readFileSync(pathService.resolve(__dirname, './assets/17kb_text_file.txt'), 'utf-8');
          const path = '/chat-test/1/interactions/111/messages';

          const response = await request
            .post(path)
            .set(headers)
            .send({ payload: { body: fileContent } });
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.text).toEqual('');
        });
      });
    });
  });
});
