(import './env.jsonnet')
{
  geo: 'eu',
  global_accelerators: ['apigw-api-eu', 'apigw-api-eu-3', 'apigw-api-eu-4'],
  gitTags+: {
    'monitoring-apps'+: {
      vmagent: 'master',
    },
  },
}
