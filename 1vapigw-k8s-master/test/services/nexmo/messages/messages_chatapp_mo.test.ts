import { getHostList, getHostDomainsList, servicesConf, selectedRegion, selectedEnv } from '../../../config/get-urls-by-env';
import { TRACE_ID_HEADER } from '../../../consts/consts';
import { LobTypes } from '../../../consts/lobTypes';
import { StatusCodes } from 'http-status-codes';
import { envoy404, envoy403 } from '../../../consts/nexmoResponses';
import { defaultRequest } from '../../../utils/default-request';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// service isn;t available in qa just dev and prod
/**
 * @service messages_chatapp_mo
 * @lob nexmo
 * @prod euw1 euc1 apse1 apse2 use1 usw2
//  * @qa euw1 euc1
 * @dev euw1
 * @prodNotifyChannel api-olympus-alerts
 */

const service = 'messages_chatapp_mo';

function validateResponseHeaders(header) {
  // expect(header['x-frame-options']).toEqual('deny');
  expect(header['x-xss-protection']).toEqual('1; mode=block');
  expect(header['strict-transport-security']).toEqual('max-age=31536000; includeSubdomains');
  expect(header['x-content-type-options']).toEqual('nosniff');
}

describe('Nexmo', () => {
  describe.each(getHostList(LobTypes.API))('Sanity - %s', host => {
    let request;
    const chatappmoDomains = getHostDomainsList(servicesConf.api.messagesaws.chatappmo[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(chatappmoDomains)('domain - %s', domain => {
        const headers = {
          Host: domain,
        };
        const mmsHeaders = {
          ...headers,
          'Content-Type': 'text/xml;charset=utf-8',
        };

        // ##### /chatapp/mo/whatsapp-cloud-api
        test('GET /chatapp/mo/whatsapp-cloud-api - Should return 404', async () => {
          const path = `/chatapp/mo/whatsapp-cloud-api`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /chatapp/mo/whatsapp-cloud-api - Should return 200', async () => {
          const path = `/chatapp/mo/whatsapp-cloud-api`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /chatapp/mo/whatsapp-cloud-api - Should return 403', async () => {
          const path = `/chatapp/mo/whatsapp-cloud-api`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // ##### /chatapp/mo/rcs_google
        test('GET /chatapp/mo/rcs_google/{agentId} - Should return 404', async () => {
          const path = `/chatapp/mo/rcs_google/invalid_agent_id`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /chatapp/mo/rcs_google/{agentId} - Should return 200', async () => {
          const path = `/chatapp/mo/rcs_google/invalid_agent_id`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /chatapp/mo/rcs_google/{agentId} - Should return 403', async () => {
          const path = `/chatapp/mo/rcs_google/invalid_agent_id`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // ##### /chatapp/mo/rcs_google_dotgo
        test('GET /chatapp/mo/rcs_google_dotgo/{agentId} - Should return 404', async () => {
          const path = `/chatapp/mo/rcs_google_dotgo/invalid_agent_id`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /chatapp/mo/rcs_google_dotgo/{agentId} - Should return 200', async () => {
          const path = `/chatapp/mo/rcs_google_dotgo/invalid_agent_id`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /chatapp/mo/rcs_google_dotgo/{agentId} - Should return 403', async () => {
          const path = `/chatapp/mo/rcs_google_dotgo/invalid_agent_id`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // ##### /chatapp/mo/rcs_gsma_orange_es
        test('GET /chatapp/mo/rcs_gsma_orange_es/{agentId} - Should return 404', async () => {
          const path = `/chatapp/mo/rcs_gsma_orange_es/my_agent_id`;
          const response = await request.get(path).set(headers);
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          validateResponseHeaders(response.header);
        });

        test('POST /chatapp/mo/rcs_gsma_orange_es/{agentId} - Should return 200', async () => {
          const path = `/chatapp/mo/rcs_gsma_orange_es/my_agent_id`;
          const response = await request.post(path).set(headers);
          expect(response.status).toEqual(StatusCodes.OK);
          validateResponseHeaders(response.header);
        });

        test('PUT /chatapp/mo/rcs_google_dotgo/{agentId} - Should return 403', async () => {
          const path = `/chatapp/mo/rcs_gsma_orange_es/my_agent_id`;
          const response = await request.put(path).set(headers);
          expect(response.status).toEqual(StatusCodes.FORBIDDEN);
          expect(response.text).toEqual(envoy403);
          validateResponseHeaders(response.header);
        });

        // connectors deployed only in eu regions
        if (selectedRegion.startsWith('eu') || selectedEnv == 'dev') {
          // ##### /chatapp/mo/whatsapp
          test('GET /chatapp/mo/whatsapp - Should return 404', async () => {
            const path = `/chatapp/mo/whatsapp`;
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            validateResponseHeaders(response.header);
          });

          test('POST /chatapp/mo/whatsapp - Should return 404', async () => {
            const path = `/chatapp/mo/whatsapp`;
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            validateResponseHeaders(response.header);
          });

          test('PUT /chatapp/mo/whatsapp - Should return 403', async () => {
            const path = `/chatapp/mo/whatsapp`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          // ##### /chatapp/mo/messenger
          test('GET /chatapp/mo/messenger - Should return 404', async () => {
            const path = `/chatapp/mo/messenger`;
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            validateResponseHeaders(response.header);
          });

          test('POST /chatapp/mo/messenger - Should return 200', async () => {
            const path = `/chatapp/mo/messenger`;
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          });

          test('PUT /chatapp/mo/messenger - Should return 403', async () => {
            const path = `/chatapp/mo/messenger`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          // ##### /chatapp/mo/instagram
          test('GET /chatapp/mo/instagram - Should return 404', async () => {
            const path = `/chatapp/mo/instagram`;
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            validateResponseHeaders(response.header);
          });

          test('POST /chatapp/mo/instagram - Should return 200', async () => {
            const path = `/chatapp/mo/instagram`;
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          });

          test('PUT /chatapp/mo/instagram - Should return 403', async () => {
            const path = `/chatapp/mo/instagram`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });

          // ##### /chatapp/mo/viber_service_msg
          test('GET /chatapp/mo/viber_service_msg - Should return 404', async () => {
            const path = `/chatapp/mo/viber_service_msg`;
            const response = await request.get(path).set(headers);
            expect(response.status).toEqual(StatusCodes.NOT_FOUND);
            validateResponseHeaders(response.header);
          });

          test('POST /chatapp/mo/viber_service_msg - Should return 200', async () => {
            const path = `/chatapp/mo/viber_service_msg`;
            const response = await request.post(path).set(headers);
            expect(response.status).toEqual(StatusCodes.OK);
            validateResponseHeaders(response.header);
          });

          test('PUT /chatapp/mo/viber_service_msg - Should return 403', async () => {
            const path = `/chatapp/mo/viber_service_msg`;
            const response = await request.put(path).set(headers);
            expect(response.status).toEqual(StatusCodes.FORBIDDEN);
            expect(response.text).toEqual(envoy403);
            validateResponseHeaders(response.header);
          });
        }
        // connectors deployed only in us regions
        if (selectedRegion.startsWith('us') || selectedEnv == 'dev') {
          const mm7Paths = [
            `/chatapp/mo/mms_vibes`, // vibes doesn't have the mm7 postfix
            `/chatapp/mo/mms_sinch/mm7`,
            `/chatapp/mo/mms_imi/mm7`,
            `/chatapp/mo/mms_att/mm7`,
          ];

          mm7Paths.forEach(path => {
            test(`GET ${path} - Should return 404`, async () => {
              const response = await request.get(path).set(mmsHeaders);
              expect(response.status).toEqual(StatusCodes.NOT_FOUND);
              validateResponseHeaders(response.header);
            });

            test(`POST ${path} - Should return 200`, async () => {
              const response = await request.post(path).set(mmsHeaders);
              expect(response.status).toEqual(StatusCodes.OK);
              validateResponseHeaders(response.header);
            });

            test(`PUT ${path} - Should return 403`, async () => {
              const response = await request.put(path).set(mmsHeaders);
              expect(response.status).toEqual(StatusCodes.FORBIDDEN);
              expect(response.text).toEqual(envoy403);
              validateResponseHeaders(response.header);
            });

            test(`POST ${path} - Should return 400`, async () => {
              const response = await request
                .post(path)
                .set(mmsHeaders)
                .send(
                  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n' +
                    '    <soapenv:Header>\n' +
                    '        <TransactionID xmlns="http://www.3gpp.org/ftp/Specs/archive/23_series/23.140/schema/REL-6-MM7-1-4" soapenv:mustUnderstand="1">81fbae9f-db63-4c19-b46a-ec130391df46D-5</TransactionID>\n' +
                    '    </soapenv:Header>\n' +
                    '    <soapenv:Body/>\n' +
                    '</soapenv:Envelope>',
                );
              expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
              validateResponseHeaders(response.header);
            });
          });
        }
      });
    });
  });
});
