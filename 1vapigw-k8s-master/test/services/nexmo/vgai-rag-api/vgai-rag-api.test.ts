import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';
import { LobTypes } from '../../../consts/lobTypes';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service vgai-rag-api
 * @lob nexmo
 * @dev euw1
 * @qa euw1
 * @prod euw1 euc1 use1
 * @notifyChannel ai-gloo-dev-qa
 * @prodNotifyChannel ai-gloo-prod
 */

const service = 'vgai-rag-api';

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;
    let headers = {};

    const ragDomain = getHostDomainsList(servicesConf.api['vgai-rag-api']?.[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(ragDomain)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        test('GET /vidya/v1/account - Should get 401 because the account does not exist', async () => {
          const path = '/vidya/v1/account?test=true';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          const body = JSON.parse(response.text);
          // console.log(body);
          expect(body.message).toEqual('Account not found.');
        });

        test('GET /vidya/v1/knowledgebase - Should get 401 because the account is not valid one', async () => {
          const path = '/vidya/v1/knowledgebase?test=true';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          const body = JSON.parse(response.text);
          // console.log(body);
          expect(body.message).toEqual('Account not found.');
        });

        test('GET /vidya/v1/source - Should get 401 because the account is not valid one', async () => {
          const path = '/vidya/v1/source?test=true';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          const body = JSON.parse(response.text);
          // console.log(body);
          expect(body.message).toEqual('Account not found.');
        });

        test('GET /vidya/v1/query - Should get 401 because the account is not valid one', async () => {
          const path = '/vidya/v1/query?kb=zendesk&query=How%20to%20publish%20telephony%20agent&test=true';
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          const body = JSON.parse(response.text);
          // console.log(body);
          expect(body.message).toEqual('Account not found.');
        });
        test('POST /vidya/v1/feedback - Should get 401 because the account is not valid one', async () => {
          const path = '/vidya/v1/feedback';
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          const body = JSON.parse(response.text);
          // console.log(body);
          expect(body.message).toEqual('Account not found.');
        });
      });
    });
  });
});
