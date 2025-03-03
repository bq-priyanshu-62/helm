import supertest = require('supertest');

export async function getMyIp() {
  const request = supertest('ifconfig.me');
  const response = await request.get('');

  return response.text;
}
