import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import qs from 'querystring';
import { defaultRequest } from '../../../utils/default-request';
import { getSecret } from '../../../utils/get-secret';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service sms_rest_internal_auth
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2 apse3 mec1
 * @dev euw1
 * @prodNotifyChannel active:telco-alert passive:telco-alerts-icinga
 */

describe('Nexmo SMS-FE', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const smsRestDomains = getHostDomainsList(servicesConf.api.sms_rest[selectedRegion]);
    let noQuotaApiKey;

    beforeAll(async () => {
      request = defaultRequest(host);
      noQuotaApiKey = await getSecret(servicesConf.api.testAccount);
    });

    !!smsRestDomains &&
      smsRestDomains.length > 0 &&
      describe('Invalid Auth', () => {
        describe.each(smsRestDomains)('domain - %s', smsDomain => {
          const headers = {
            Host: smsDomain,
            'x-original-client-ip-address': '0.0.0.0',
            'x-api': 'sms-fe',
            'x-sms-compatibility-mode': 'TRUE',
            'Content-Type': 'text/html',
          };

          // ##### /sms/json/internal

          test('POST /sms/json/internal - Should return 401', async () => {
            const params = {
              username: 'test',
            };
            const path = `/sms/json/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/json/internal - Should return 401', async () => {
            const params = {
              username: 'test',
              password: '',
            };
            const path = `/sms/json/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/json/internal - Wrong password - Should return 401', async () => {
            const params = {
              username: 'test',
              password: 'wrong pass',
            };
            const path = `/sms/json/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/json/internal - Wrong password - Should return 401', async () => {
            const params = {
              username: 'test',
              password: 'test',
            };
            const path = `/sms/json/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/json/internal - with sig - Should return 401', async () => {
            const params = {
              username: 'test',
              password: 'test',
              from: '1234',
              sig: 'inv',
            };
            const path = `/sms/json/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          // ##### /sms/xml/internal

          test('POST /sms/xml/internal - Should return 401', async () => {
            const params = {
              username: 'test',
            };
            const path = `/sms/xml/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/xml/internal - Should return 401', async () => {
            const params = {
              username: 'test',
              password: '',
            };
            const path = `/sms/xml/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/xml/internal - Wrong password - Should return 401', async () => {
            const params = {
              username: 'test',
              password: 'wrong pass',
            };
            const path = `/sms/xml/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/xml/internal - Wrong password - Should return 401', async () => {
            const params = {
              username: 'test',
              password: 'test',
            };
            const path = `/sms/xml/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/xml/internal - Wrong password with 0 balance - Should return 401', async () => {
            const params = {
              username: noQuotaApiKey,
              password: 'invalid',
              from: '12345',
            };
            const path = `/sms/xml/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });

          test('POST /sms/xml/internal - with sig - Should return 401', async () => {
            const params = {
              username: 'test',
              password: 'test',
              from: '1234',
              sig: 'inv',
            };
            const path = `/sms/xml/internal?` + qs.stringify(params);
            const response = await request.post(path).set(headers).send('Random Text');
            expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          });
        });
      });
  });
});
