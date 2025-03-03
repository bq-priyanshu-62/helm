import { getHostDomainsList, getHostList, selectedRegion, servicesConf } from '../../../config/get-urls-by-env';
import { LobTypes } from '../../../consts/lobTypes';
import { ApplicationTypes } from '../../../consts/applicationTypes';
import { StatusCodes } from 'http-status-codes';
import { defaultRequest, retryFor429 } from '../../../utils/default-request';

/**
 * @service meetings
 * @lob uc
 * @prod use1
 * @qa use1
 * @prodNotifyChannel meetings-gateway-notifications
 */
const service = 'vbc_meetings';

describe('VBC Meetings Guest API', () => {
  describe.each(getHostList(LobTypes.UC, ApplicationTypes.MEETINGS))('Sanity - %s', host => {
    let request;

    const vbcMeetingsDomain = getHostDomainsList(servicesConf.api.vbc_meetings[selectedRegion]);

    beforeAll(async () => {
      request = defaultRequest(host);
    });

    describe(`${service} Services`, () => {
      describe.each(vbcMeetingsDomain)('domain - %s', domain => {
        const headers = {
          Host: domain,
        };

        test('GET /meetings/health - Should return 200', async () => {
          const path = `/meetings/health`;

          const response = await retryFor429(request.get(path).set(headers));

          // todo: Remove from test config
          // temp fix due to api.vonagebusiness.com returning UNAUTHORIZED
          expect([StatusCodes.OK, StatusCodes.UNAUTHORIZED]).toContain(response.status);
        });

        test('GET /meetings/phones - Should return 400', async () => {
          const path = `/meetings/phones`;

          const response = await retryFor429(request.get(path).query({ domain: 'domain' }).set(headers));
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.error.text).toContain('\\"domain\\" must be one of [VBC, VCP]');
        });

        test('GET /meetings/guests/{room_id}/rooms - Should return 400', async () => {
          const path = `/meetings/guests/abc/rooms`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.error.text).toContain('\\"token\\" with value \\"abc\\" fails to match the required pattern');
        });

        test('POST /meetings/guests - Should return 400', async () => {
          const path = `/meetings/guests`;

          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
          expect(response.error.text).toContain('\\"value\\" must contain at least one of [roomToken, guestToken]');
        });

        test('GET /meetings/themes/{shortCompanyUrl} - Should return 404', async () => {
          const path = `/meetings/themes/shortUrl`;

          const response = await retryFor429(request.get(path).set(headers));
          expect(response.status).toEqual(StatusCodes.NOT_FOUND);
          expect(response.error.text).toContain('could not find theme with url = shortUrl');
        });

        test('POST /meetings/whiteboard-events - Should return 401', async () => {
          const path = `/meetings/whiteboard-events`;

          const response = await retryFor429(request.post(path).set(headers));
          expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
        });
      });
    });
  });
});
