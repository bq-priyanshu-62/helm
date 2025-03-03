import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';
import { v4 as uuidv4 } from 'uuid';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service domains_service
 * @lob nexmo
 * @prod use1 usw2 euw1 euc1 apse1 apse2
 * @qa
 * @dev euw1 euc1
 * @prodNotifyChannel active:rtc-alerts passive:rtc-smoke-tests-passive-apigw
 */

const service = 'domains_service';
const sleep = ms => new Promise(r => setTimeout(r, ms));
var num = Math.floor(Math.random() * 9000) + 1000;

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    let authorization;
    let headers = {
      [TRACE_ID_HEADER]: `1vapigw-${service}-sanity-test`,
    };

    const dsDomain = getHostDomainsList(servicesConf.api.domains_service[selectedRegion]);
    let domainName = '';

    beforeAll(async () => {
      request = defaultRequest(host);
      authorization = await getSecret(servicesConf.api.authorization);
      headers['Authorization'] = authorization;
    });

    describe(`${service} Services`, () => {
      describe.each(dsDomain)('domain - %s', domain => {
        domainName = 'ds' + domain + '-' + selectedRegion + '-' + num;
        domainName = domainName.replace(/\./g, '-');
        const headers = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-nexmo-prod',
          Authorization: authorization,
          'Content-Type': 'application/json',
        };

        const badAuthHeaders = {
          Host: domain,
          [TRACE_ID_HEADER]: '1vapigw-nexmo-prod',
          Authorization: 'bad_auth',
          'Content-Type': 'application/json',
        };

        test('POST /v1/psip - Should return 201', async () => {
          headers['Authorization'] = authorization;
          const path = `/v1/psip`;
          const body =
            `{
            "name": "` +
            domainName +
            `",
            "application_id": "d2b4cc12-3209-4a9c-ae41-ca00a9a28de9",
            "tls": "always",
            "srtp": "always",
            "acl": [
                "50.127.127.0/29"
            ],
            "digest_auth": "True"
          }`;
          // let response = await request.delete(path + '/' + domainName).set(headers);
          // await sleep(10000);
          let response = await request.post(path).set(headers).send(body);
          if (response.status == 400) {
            // if a previous test didn't reach the DELETE case, the domain may
            // still exist and cause a 400 response. Try deleting the domain and
            // retry the POST request
            //console.log('domain "' + domainName + '" already exists! Deleting and recreating')
            response = await request.delete(path + '/' + domainName).set(headers);
            response = await request.post(path).set(headers).send(body);
          }
          expect(response.status).toEqual(StatusCodes.CREATED);
          validateResponseHeaders(response.header);
        });

        test('POST /v1/psip - bad auth - Should return 401', async () => {
          headers['Authorization'] = authorization;
          const path = `/v1/psip`;
          const body =
            `{
            "name": "` +
            domainName +
            `",
            "application_id": "d2b4cc12-3209-4a9c-ae41-ca00a9a28de9",
            "tls": "always",
            "srtp": "always",
            "acl": [
                "50.127.127.0/29"
            ],
            "digest_auth": "True"
          }`;
          let response = await request.post(path).set(badAuthHeaders).send(body);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/psip/' + domainName + ' - Should return 200', async () => {
          await sleep(10000);
          headers['Authorization'] = authorization;
          const path = `/v1/psip/` + domainName;
          const response = await request
            .put(path)
            .set(headers)
            .send(
              `{
            "name": "` +
                domainName +
                `",
            "application_id": "d2b4cc12-3209-4a9c-ae41-ca00a9a28de9",
            "tls": "always",
            "srtp": "always",
            "acl": [
                "50.127.127.0/29"
            ],
            "digest_auth": "False"
          }`,
            );
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /v1/psip/' + domainName + ' - bad auth - Should return 401', async () => {
          const path = `/v1/psip/` + domainName;
          const response = await request
            .put(path)
            .set(badAuthHeaders)
            .send(
              `{
            "name": "` +
                domainName +
                `",
            "application_id": "d2b4cc12-3209-4a9c-ae41-ca00a9a28de9",
            "tls": "always",
            "srtp": "always",
            "acl": [
                "50.127.127.0/29"
            ],
            "digest_auth": "False"
          }`,
            );
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/psip/' + domainName + ' - Should return 200', async () => {
          await sleep(10000);
          headers['Authorization'] = authorization;
          const path = `/v1/psip/` + domainName;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('GET /v1/psip/' + domainName + ' - bad auth - Should return 401', async () => {
          const path = `/v1/psip/` + domainName;
          const response = await request.get(path).set(badAuthHeaders);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/psip/' + domainName + ' - Should return 200', async () => {
          await sleep(10000);
          headers['Authorization'] = authorization;
          const path = `/v1/psip/` + domainName;
          const response = await request.delete(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('DELETE /v1/psip/' + domainName + ' - bad auth - Should return 401', async () => {
          const path = `/v1/psip/` + domainName;
          const response = await request.delete(path).set(badAuthHeaders);
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          validateResponseHeaders(response.header);
        });
      });
    });
  });
});
