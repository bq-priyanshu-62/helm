import { getHostList, getHostDomainsList, servicesConf, selectedRegion } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { ApplicationTypes } from '../../../consts/applicationTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';

/**
 * @service meetings_api
 * @lob nexmo
 * @prod use1 usw2 euw1 euc1
 * @qa use1 euw1 euc1
 * @prodNotifyChannel meetings-gateway-notifications
 */
const service = 'meetings_api';

describe('Meetings API', () => {
  describe.each(getHostList(LobTypes.API, ApplicationTypes.MEETINGS))('Sanity - %s', host => {
    let request;

    const meetingsAPIDomain = getHostDomainsList(servicesConf.api.meetings[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(meetingsAPIDomain)('domain - %s', domain => {
        const headers = {
          Host: domain,
        };

        test('GET /beta/meetings/health - Should return 200', async () => {
          const path = '/beta/meetings/health';
          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('version_number');
        });

        test('GET /beta/meetings/ping - Should return 200', async () => {
          const path = '/beta/meetings/ping';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('version_number');
        });

        test('HEAD /beta/meetings/health - Should return 200', async () => {
          const path = '/beta/meetings/health';

          const response = await retryFor429(request.head(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('HEAD /beta/meetings/ping - Should return 200', async () => {
          const path = '/beta/meetings/ping';

          const response = await retryFor429(request.head(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /beta/meetings/recordings - Should return 401', async () => {
          const path = '/beta/meetings/recordings';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /beta/meetings/recordings/foo - Should return 401', async () => {
          const path = '/beta/meetings/recordings/foo';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /beta/meetings/rooms - Should return 401', async () => {
          const path = '/beta/meetings/rooms';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /meetings/health - Should return 200', async () => {
          const path = '/meetings/health';
          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('version_number');
        });

        test('GET /meetings/ping - Should return 200', async () => {
          const path = '/meetings/ping';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('version_number');
        });

        test('HEAD /meetings/health - Should return 200', async () => {
          const path = '/meetings/health';

          const response = await retryFor429(request.head(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('HEAD /meetings/ping - Should return 200', async () => {
          const path = '/meetings/ping';

          const response = await retryFor429(request.head(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /meetings/recordings - Should return 401', async () => {
          const path = '/meetings/recordings';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /meetings/recordings/foo - Should return 401', async () => {
          const path = '/meetings/recordings/foo';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /meetings/rooms - Should return 401', async () => {
          const path = '/meetings/rooms';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /v1/meetings/health - Should return 200', async () => {
          const path = '/v1/meetings/health';
          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('version_number');
        });

        test('GET /v1/meetings/ping - Should return 200', async () => {
          const path = '/v1/meetings/ping';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
          expect(response.text).toContain('version_number');
        });

        test('HEAD /v1/meetings/health - Should return 200', async () => {
          const path = '/v1/meetings/health';

          const response = await retryFor429(request.head(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('HEAD /v1/meetings/ping - Should return 200', async () => {
          const path = '/v1/meetings/ping';

          const response = await retryFor429(request.head(path).set(headers));

          expect(response.status).toEqual(StatusCodes.OK);
        });

        test('GET /v1/meetings/recordings - Should return 401', async () => {
          const path = '/v1/meetings/recordings';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /v1/meetings/recordings/foo - Should return 401', async () => {
          const path = '/v1/meetings/recordings/foo';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });

        test('GET /v1/meetings/rooms - Should return 401', async () => {
          const path = '/v1/meetings/rooms';

          const response = await retryFor429(request.get(path).set(headers));

          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(response.body.title).toContain('Missing Auth');
        });
      });
    });
  });
});
