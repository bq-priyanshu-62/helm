{
  team: '1v-api-gw',

  syncWave: {
    serviceAccSyncOrder: '-6',
    hookSyncOrder: '-5',
  },

  environment: 'qa',
  account: '1v-apigw-qa',
  aws_account_id: '507728974998',

  monitoring+: {
    influxdb_url: 'http://qa-victoriametrics.neo.vocalocity.com:8428/api/v1/write',
  },

  gitTags+: {
    'aws-apps': {
      'external-dns': 'master',
      'aws-load-balancer-controller': 'master',
    },
    'monitoring-apps': {
      yace: 'master',
      prisma: 'master',
      vmagent: 'master',
      'vmagent-pet': 'master',
      'kube-state-metrics': 'master',
      'fluentd-sre': 'master',
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
