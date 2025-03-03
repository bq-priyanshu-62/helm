import * as fs from 'fs';
const yaml = require('js-yaml');

export function loadEnv(): any {
  const env = process.env.NODE_ENV.split('.')[0];
  const absolutePath = require('path').resolve(__dirname, `./${env}.yaml`);

  const doc = yaml.load(fs.readFileSync(absolutePath, 'utf8'));

  return doc;
}
