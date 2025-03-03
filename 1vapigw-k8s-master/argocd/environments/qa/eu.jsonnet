(import './env.jsonnet')
{
  geo: 'eu',
  gitTags+: {
    'monitoring-apps'+: {
      vmagent: 'master',
    },
  },
}
