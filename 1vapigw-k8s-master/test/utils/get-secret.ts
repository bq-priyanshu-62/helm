import fs from 'fs';
import path from 'path';

const secretsFilePath = path.resolve(__dirname, process.env.HOME + '/secrets.json');

const secrets = JSON.parse(fs.readFileSync(secretsFilePath, 'utf-8'));

export const getSecret = async (secretKey: string) => {
  const fullSecretKey = `global/api-gw/aws/gatewaytest/credentials/${secretKey}`;

  if (secrets[fullSecretKey]) {
    return secrets[fullSecretKey];
  } else {
    console.error(`Secret for key ${fullSecretKey} not found.`);
    return '';
  }
};
