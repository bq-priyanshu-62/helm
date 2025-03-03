(import './env.jsonnet')
{
  geo: 'us',
  gitTags+: {
    'monitoring-apps'+: {
      vmagent: 'master',
    },
  },
}
