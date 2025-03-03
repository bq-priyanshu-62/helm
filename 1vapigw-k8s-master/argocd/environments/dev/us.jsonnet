(import './env.jsonnet')
{
  geo: 'us',
  global_accelerators: ['apigw-api-us-uc'],
  gitTags+: {
    'monitoring-apps'+: {
      vmagent: 'master',
    },
  },
}
