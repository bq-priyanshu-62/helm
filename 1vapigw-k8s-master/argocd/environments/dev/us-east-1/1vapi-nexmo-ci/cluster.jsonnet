(import '../region.jsonnet')
{
  vg_cluster: 'nexmo-ci',
  cluster_id: '1vapi-nexmo-ci',
  gitTags+: {
    'root-apps'+: {
      'aws-apps': 'master',
      'kube-system': 'master',
      'monitoring-apps': 'master',
    },
    'monitoring-apps'+: {
      yace: 'master',
      'kube-state-metrics': 'master',
      'falcon-sensor': 'master',
    },
    'kube-system'+: {
      'metrics-server': 'master',
      'cluster-autoscaler': 'master',
      'aws-ebs-csi-driver': 'master',
    },
    'aws-apps'+: {
      'aws-load-balancer-controller': 'master',
      'external-dns': 'master',
    },
  },
}
