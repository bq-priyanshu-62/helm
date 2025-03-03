import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service accounts-secrets
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
//  * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'accounts-secrets';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const costDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let authorization;
    let testAccount;
    let headers = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };
    let accountIDs = ['guarantee_non_sense'];

    beforeAll(async () => {
      authorization = await getSecret(servicesConf.api.authorization);
      testAccount = await getSecret(servicesConf.api.testAccount);
      headers['Authorization'] = authorization;
      request = defaultRequest(host);
      accountIDs = [...accountIDs, testAccount];
    });

    describe(`${service} Services`, () => {
      describe.each(costDomains)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        const testConfigs = [
          { accountIndex: 1, isValidAccount: true },
          { accountIndex: 0, isValidAccount: false },
        ];

        describe.each(testConfigs)('config - %s', cfg => {
          test(`HEAD /accounts/accountIDs[${cfg.accountIndex}]/secrets`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/secrets`;
            const response = await request.head(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.OK);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            }
            validateResponseHeaders(response.header);
          });

          test(`GET /accounts/accountIDs[${cfg.accountIndex}]/secrets`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/secrets`;
            const response = await request.get(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.OK);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`POST /accounts/accountIDs[${cfg.accountIndex}]/secrets`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/secrets`;
            const response = await request.post(path).set(headers);
            //Upstream returns the same code 415 with or without valid account
            expect(response.status).toEqual(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
            validateResponseHeaders(response.header);
          });

          test(`DELETE /accounts/accountIDs[${cfg.accountIndex}]/secrets`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/secrets`;
            const response = await request.delete(path).set(headers);
            //Upstream returns the same code 405 with or without valid account
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            validateResponseHeaders(response.header);
          });
        });
      });
    });
  });
});
