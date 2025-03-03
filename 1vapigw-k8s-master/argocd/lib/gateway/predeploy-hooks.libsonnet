local argocd = import '../argocd.libsonnet';
local awsScript = import '../cluster-active-script.libsonnet';
local k8s = import '../k8s.libsonnet';

function(hookPostfix, config, namespace='argocd') {

  PredeployHook:
    local clusterId = config.cluster_id;
    local vgRegion = config.vg_region;
    local clusterRegion = config.region;
    local script = awsScript(config.global_accelerators, clusterId, vgRegion, clusterRegion).PredeployScript;
    local argocdAwsSvcAcc = 'argocd-aws-svc-acc';
    argocd.Hook.new(
      hookPostfix,
      'PreSync',
      [argocd.Hook.container(
        'awscli',
        'amazon/aws-cli',
        ['/bin/bash', '-c', script],
      )],
      'Never',
      2,
      config.syncWave.hookSyncOrder,
      namespace,
      'HookSucceeded',
      argocdAwsSvcAcc
    ),
  PredeployHookSvcAcc:
    local argocdAwsSvcAcc = 'argocd-aws-svc-acc';
    k8s.IAMServiceAccount(
      argocdAwsSvcAcc,
      namespace=namespace,
      syncWaveOrder=config.syncWave.serviceAccSyncOrder,
      annotationList=
      [{
        key: 'eks.amazonaws.com/role-arn',
        value: 'arn:aws:iam::%s:role/api/application-%s-%s-k8s-argocd-aws' % [config.aws_account_id, config.region, config.cluster_id],
      }],
    ),

  setup: [
    $.PredeployHookSvcAcc,
    $.PredeployHook,
  ],
}
