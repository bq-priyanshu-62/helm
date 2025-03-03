{
  team: '1v-api-gw',

  syncWave: {
    serviceAccSyncOrder: '-6',
    hookSyncOrder: '-5',
  },

  environment: 'dev',
  account: '1v-apigw-dev',
  aws_account_id: '684154893900',

  monitoring+: {
    influxdb_url: 'http://qa-victoriametrics.neo.vocalocity.com:8428/api/v1/write',
  },

  gitTags+: {
    'root-apps': {
      viam: 'master',
    },
    'aws-apps': {
      'external-dns': 'master',
      'aws-load-balancer-controller': 'master',
    },
    'monitoring-apps': {
      'fluentd-sre': 'master',
      yace: 'master',
      vmagent: 'master',
      'vmagent-pet': 'master',
      'kube-state-metrics': 'master',
      fluentbit: 'master',
      'custom-metrics-server': 'master',
      'victoria-metrics-single-server': 'master',
      'falcon-sensor': 'master',
    },
    'kube-system': {
      'metrics-server': 'master',
      'cluster-autoscaler': 'master',
      'service-account': 'master',
    },
  },
}
