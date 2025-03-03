import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy403, envoy404 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service partnerapi
 * @lob nexmo
 * @prod euc1 euw1 apse1 apse2 use1 usw2
//  * @qa euc1 euw1 apse1 apse2 use1 usw2
 * @dev euw1
 * @prodNotifyChannel api-system-services-notify
 */

const service = 'partnerapi';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const partnerapiDomains = getHostDomainsList(servicesConf.api[service][selectedRegion]);
    let authorization;
    let testAccount;
    const testConfigs = [
      { accountIndex: 1, isValidAccount: true },
      { accountIndex: 0, isValidAccount: false },
    ];
    let accountIDs = ['guarantee_non_sense'];

    let headers = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      testAccount = await getSecret(servicesConf.api.testAccount);
      headers['Authorization'] = authorization;
      accountIDs = [...accountIDs, testAccount];
    });

    describe(`${service} Services`, () => {
      describe.each(partnerapiDomains)('domain - %s', domain => {
        beforeAll(async () => {
          headers['Host'] = domain;
        });

        describe.each(testConfigs)('config - %s', cfg => {
          test(`HEAD /accounts/accountIDs[${cfg.accountIndex}]/subaccounts`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts`;
            const response = await request.head(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.OK);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            }
            validateResponseHeaders(response.header);
          });

          test(`GET /accounts/accountIDs[${cfg.accountIndex}]/subaccounts`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts`;
            const response = await request.get(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.OK);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`POST /accounts/accountIDs[${cfg.accountIndex}]/subaccounts`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts`;
            const response = await request.post(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`PATCH /accounts/accountIDs[${cfg.accountIndex}]/subaccounts`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts`;
            const response = await request.patch(path).set(headers);
            //Upstream returns the same code 405 with or without valid account
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            validateResponseHeaders(response.header);
          });

          test(`PUT /accounts/accountIDs[${cfg.accountIndex}]/subaccounts - Should return 403`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          test(`HEAD /accounts/accountIDs[${cfg.accountIndex}]/subaccounts/invalid_route`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts/invalid_route`;
            const response = await request.head(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toBeUndefined();
            validateResponseHeaders(response.header);
          });

          test(`GET /accounts/accountIDs[${cfg.accountIndex}]/subaccounts/invalid_route`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts/invalid_route`;
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            expect(response.text).toContain('"Invalid API Key"');
            validateResponseHeaders(response.header);
          });

          test(`POST /accounts/accountIDs[${cfg.accountIndex}]/subaccounts/invalid_route`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts/invalid_route`;
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.METHOD_NOT_ALLOWED);
            expect(response.text).toContain('"Method Not Allowed"');
            validateResponseHeaders(response.header);
          });

          test(`PATCH /accounts/accountIDs[${cfg.accountIndex}]/subaccounts/invalid_route`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts/invalid_route`;
            const response = await request.patch(path).set(headers);

            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"Invalid API Key"');
            }

            validateResponseHeaders(response.header);
          });

          test(`PUT /accounts/accountIDs[${cfg.accountIndex}]/subaccounts/invalid_route - Should return 403`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/subaccounts/invalid_route`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          test(`HEAD /accounts/accountIDs[${cfg.accountIndex}]/credit-transfers`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/credit-transfers`;
            const response = await request.head(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            }
            validateResponseHeaders(response.header);
          });

          test(`GET /accounts/accountIDs[${cfg.accountIndex}]/credit-transfers`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/credit-transfers`;
            const response = await request.get(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`POST /accounts/accountIDs[${cfg.accountIndex}]/credit-transfers`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/credit-transfers`;
            const response = await request.post(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`PUT /accounts/accountIDs[${cfg.accountIndex}]/credit-transfers - Should return 403`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/credit-transfers`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          test(`HEAD /accounts/accountIDs[${cfg.accountIndex}]/balance-transfers`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/balance-transfers`;
            const response = await request.head(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            }
            validateResponseHeaders(response.header);
          });

          test(`GET /accounts/accountIDs[${cfg.accountIndex}]/balance-transfers`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/balance-transfers`;
            const response = await request.get(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`POST /accounts/accountIDs[${cfg.accountIndex}]/balance-transfers`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/balance-transfers`;
            const response = await request.post(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`PUT /accounts/accountIDs[${cfg.accountIndex}]/balance-transfers - Should return 403`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/balance-transfers`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          test(`POST /accounts/accountIDs[${cfg.accountIndex}]/transfer-number`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/transfer-number`;
            const response = await request.post(path).set(headers);
            if (cfg.isValidAccount) {
              expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
            } else {
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              expect(response.text).toContain('"title":"Invalid API Key"');
            }
            validateResponseHeaders(response.header);
          });

          test(`PUT /accounts/accountIDs[${cfg.accountIndex}]/transfer-number - Should return 403`, async () => {
            const accountName = accountIDs[cfg.accountIndex];
            const path = `/accounts/${accountName}/transfer-number`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });
        });
      });
    });
  });
});
