import { getHostDomainsList, getHostList, selectedRegion, servicesConf } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @service sms_rest_internal
 * @lob nexmo
 * @prod euw1 euc1 use1 usw2 apse1 apse2 apse3 mec1
 * @dev euw1
 * @prodNotifyChannel active:telco-alert passive:telco-alerts-icinga
 */

describe('Nexmo SMS INTERNAL', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;

    const smsRestDomains = getHostDomainsList(servicesConf.api.sms_rest[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe('sms internal', () => {
      describe.each(smsRestDomains)('domain - %s', smsDomain => {
        // ##### /sms/json/internal

        test('GET /sms/json/internal - Should return 422', async () => {
          const path = `/sms/json/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-1',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY); // Block Internal https://jira.vonage.com/browse/APIGW-1060
        });

        test('POST /sms/json/internal - Should return 422', async () => {
          const path = `/sms/json/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-2',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        // ##### /sms/xml/internal

        test('GET /sms/xml/internal - Should return 422', async () => {
          const path = `/sms/xml/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-3',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY); // Block Internal https://jira.vonage.com/browse/APIGW-1060
        });

        test('POST /sms/xml/internal - Should return 422', async () => {
          const path = `/sms/xml/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-4',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        // ##### /v1/sms/xml/internal

        test('GET /v1/sms/xml/internal - Should return 422', async () => {
          const path = `/v1/sms/xml/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-5',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY); // Block Internal https://jira.vonage.com/browse/APIGW-1060
        });

        test('POST /v1/sms/xml/internal - Should return 422', async () => {
          const path = `/v1/sms/xml/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-6',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        // ##### /v1/sms/json/internal

        test('GET /v1/sms/json/internal - Should return 422', async () => {
          const path = `/v1/sms/json/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-7',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY); // Block Internal https://jira.vonage.com/browse/APIGW-1060
        });

        test('POST /v1/sms/json/internal - Should return 422', async () => {
          const path = `/v1/sms/json/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-8',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        // ##### /v2/sms/xml/internal

        test('GET /v2/sms/xml/internal - Should return 422', async () => {
          const path = `/v2/sms/xml/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-9',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY); // Block Internal https://jira.vonage.com/browse/APIGW-1060
        });

        test('POST /v2/sms/xml/internal - Should return 422', async () => {
          const path = `/v2/sms/xml/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-10',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });

        // ##### /v2/sms/json/internal

        test('GET /v2/sms/json/internal - Should return 422', async () => {
          const path = `/v2/sms/json/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-11',
          };

          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY); // Block Internal https://jira.vonage.com/browse/APIGW-1060
        });

        test('POST /v2/sms/json/internal - Should return 422', async () => {
          const path = `/v2/sms/json/internal`;
          const headers = {
            Host: smsDomain,
            [TRACE_ID_HEADER]: '1vapigw-sms-rest-internal-test-12',
          };

          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        });
      });
    });
  });
});
