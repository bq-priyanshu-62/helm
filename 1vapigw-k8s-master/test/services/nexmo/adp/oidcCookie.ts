import supertest, { Response } from 'supertest';

const headers: { Cookie: Array<string>; referer: string } = {
  Cookie: [],
  referer: '',
};
let loginChallenge = '';

const lowerCaseFirstLetter = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const parseCookie = (cookieString: string) => {
  const pairs = cookieString.split(';');
  const regex = /^([a-zA-Z0-9_-]+)=(\S+)$/g;

  const matches = regex.exec(pairs.shift() ?? '');

  if (!matches) return;

  const key = matches[1];
  const value = matches[2];

  const config = pairs.reduce(
    (config, pair) => {
      const [key, value] = pair.split('=');
      return { [lowerCaseFirstLetter(key.trim())]: value, ...config };
    },
    { sameSite: 'no_restriction', secure: true } as {
      sameSite: string;
      secure: boolean;
    },
  );
  return { config, key, value };
};

const parseHeaders = response => {
  const headers: Array<string> = [];

  (Array.isArray(response.headers['set-cookie']) ? response.headers['set-cookie'] : [response.headers['set-cookie']]).forEach(header => {
    if (header) {
      const cookie = parseCookie(header);

      if (cookie) {
        const { key, value } = cookie;
        headers.push(`${key}=${value}`);
      }
    }
  });

  return headers;
};

const getLoginChallenge = (response: Response) => {
  const url = response.headers['location'];

  if (url.includes('login_challenge=')) {
    const urlObject = new URL(url);
    const urlSearchParams = new URLSearchParams(urlObject.search);
    loginChallenge = Object.fromEntries(urlSearchParams.entries()).login_challenge;
  }
};

const getAuthCookie = (response: Response) => {
  const cookies = parseHeaders(response);
  const cookieToken = cookies.find(header => header.startsWith('x-auth'));

  if (cookieToken) {
    headers['x-auth'] = cookieToken;
  }
};

const sendRequest = async (url: string, cb: (response: Response) => void, num = 0) => {
  try {
    if (headers['x-auth']) return;

    const response = await supertest(url)
      .get('')
      .set({
        ...headers,
        Cookie: headers.Cookie.join(';'),
      });

    const redirectUrl = response.headers['location'];

    cb(response);

    headers.Cookie.push(...parseHeaders(response));

    if (redirectUrl) {
      await sendRequest(redirectUrl, cb, ++num);
    }
  } catch (error) {
    // Ignore
  }
};

export const oidcCookie = async ({ host, authHost, username, captchaSkip, password }) => {
  const origin = `https://${host}`;
  const authOrigin = `https://${authHost}`;

  headers.referer = `${origin}/`;

  await sendRequest(`${origin}/sign-in`, getLoginChallenge);

  const response = await supertest(authOrigin)
    .get(`/loginFlow/${username}`)
    .query({ return_to: `${authOrigin}/redirect/redirect.html?login_challenge=${loginChallenge}` })
    .set({
      'x-vng-captcha-skip': captchaSkip,
    });

  const { action, nodes } = response.body.ui;

  const csrfToken = nodes.find(({ attributes }) => attributes.name === 'csrf_token')?.attributes.value ?? '';

  headers.Cookie.push(...parseHeaders(response));

  const actionResponse = await supertest(`${authOrigin}${action}`)
    .post('')
    .send({
      csrf_token: csrfToken,
      method: 'password',
      password: password,
      password_identifier: username,
    })
    .set({
      Cookie: headers.Cookie,
      'x-vng-captcha-skip': captchaSkip,
    });

  headers.Cookie.push(...parseHeaders(actionResponse));

  await sendRequest(`${authOrigin}/loginConfirmation`, getAuthCookie);

  return { cookie: headers['x-auth'] ?? '' };
};
