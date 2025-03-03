{
  team: '1v-api-gw',

  syncWave: {
    serviceAccSyncOrder: '-6',
    hookSyncOrder: '-5',
  },

  environment: 'prod',
  account: '1v-apigw-prod',
  aws_account_id: '275313334716',

  monitoring+: {
    influxdb_url: 'http://victoriametrics.neo.vocalocity.com:8428/api/v1/write',
  },

  gitTags+: {
    'root-apps': {
      viam: 'master',
    },
    'aws-apps'+: {
      'external-dns': 'argocd-env-v2025.01.20.0640',
      'aws-load-balancer-controller': 'argocd-env-v2025.01.09.0738',
    },
    'gloo-nexmo': {
      'nexmo-cert-manager': 'argocd-env-v2025.01.10.0643',
    },
    'monitoring-apps': {
      'kube-state-metrics': 'argocd-env-v2025.01.17.0619',
      'fluentd-sre': 'argocd-env-v2024.07.25.0625',
      fluentbit: 'argocd-env-v2024.09.04.0640',
      yace: 'argocd-env-v2024.12.06.0615',
      prisma: 'argocd-env-v2025.01.28.0600',
      vmagent: 'argocd-env-v2025.01.16.0619',
      'custom-metrics-server': 'argocd-env-v2024.10.29.0600',
      'victoria-metrics-single-server': 'argocd-env-v2025.01.20.0748',
      'falcon-sensor': 'argocd-env-v2024.09.12.0903',
    },
    'kube-system': {
      'metrics-server': 'argocd-env-v2024.10.24.1239',
      'cluster-autoscaler': 'argocd-env-v2025.01.15.0719',
      'aws-ebs-csi-driver': 'argocd-env-v2024.09.26.1331',
      'service-account': 'argocd-env-v2024.05.24.0656',
    },
    viam: {
      anubis: 'master',
      'viam-auth': 'release',
    },
  },
}
