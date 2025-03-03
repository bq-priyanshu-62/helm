local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';

local lob = 'nexmo';
local project = '%s-routes-prj' % lob;
local routeRepoUrl = 'https://github.com/Vonage/1vapigw-routes.git';

// RouteTable.gateway.solo.io "nexmo-conversations-routetable" is invalid: metadata.annotations:
// Too long: must have at most 262144 bytes
// https://argoproj.github.io/argo-cd/user-guide/sync-options/#replace-resource-instead-of-applying-changes
local standardOptions = ['ServerSideApply=true'];

function(config) {
  local appsMetadata = std.foldl(
    function(accumulator, route) accumulator {
      [route.name]: {
        factoryMethod: function(name, tag) argocd.Application.new(
          '%s-rt' % name,
          project,
          argocd.Application.jbRouteSource(
            routeRepoUrl,
            if std.type(tag) == 'object' then tag.revision else tag,
            'routes/%s' % name,
            'manifest.jsonnet',
            appsGroup=name,
            env=config.environment,
            awsRegion=config.region,
            jsonnetfile=if std.type(tag) == 'object' then utils._Jsonnetfile([
              { repoUrl: routeRepoUrl, subdir: 'lib', version: tag.routeLibVersion },
              { repoUrl: routeRepoUrl, subdir: 'routes', version: tag.revision },
            ]) else ''
          ),
          argocd.Application.destination(name),
          config.environment,
          syncOptions=standardOptions + if std.objectHas(route, 'syncOptions') then route.syncOptions else [],
        ) + utils._SyncWave('10'),
      },
    },
    [
      { name: 'nexmo-10dlc' },
      { name: 'nexmo-accounts-secrets' },
      { name: 'nexmo-admin-dashboard' },
      { name: 'nexmo-applications' },
      { name: 'nexmo-argocd' },
      { name: 'nexmo-auditevent' },
      { name: 'nexmo-auth' },
      { name: 'nexmo-capi' },
      { name: 'nexmo-conversations' },
      { name: 'nexmo-conversations-v01' },
      { name: 'nexmo-conversations-v02' },
      { name: 'nexmo-conversations-v03' },
      { name: 'nexmo-conversions' },
      { name: 'nexmo-cost' },
      { name: 'nexmo-credentials' },
      { name: 'nexmo-cs-ips' },
      { name: 'nexmo-dashboard' },
      { name: 'nexmo-devapi-rest' },
      { name: 'nexmo-domains-service' },
      { name: 'nexmo-enforcer-service' },
      { name: 'nexmo-fd-alerts-generator' },
      { name: 'nexmo-generic-rate-limiting' },
      { name: 'nexmo-gloo-errors' },
      { name: 'nexmo-gw-sl-poc' },
      { name: 'nexmo-management-console' },
      { name: 'nexmo-media' },
      { name: 'nexmo-messages' },
      { name: 'nexmo-messaging-queue-metrics' },
      { name: 'nexmo-neru' },
      { name: 'nexmo-ni' },
      { name: 'nexmo-ni-rest' },
      { name: 'nexmo-ni-v2' },
      { name: 'nexmo-number-inventory' },
      { name: 'nexmo-numberpools' },
      { name: 'nexmo-partnerapi' },
      { name: 'nexmo-phub-pools' },
      { name: 'nexmo-phub-prov' },
      { name: 'nexmo-push' },
      { name: 'nexmo-rate-limiting-sanity' },
      { name: 'nexmo-redact' },
      { name: 'nexmo-reports' },
      { name: 'nexmo-sms' },
      { name: 'nexmo-sms-internal' },
      { name: 'nexmo-tokbox' },
      { name: 'nexmo-tokbox-tools' },
      { name: 'nexmo-tools' },
      { name: 'nexmo-tts' },
      { name: 'nexmo-utilities' },
      { name: 'nexmo-vapi' },
      { name: 'nexmo-verify' },
      { name: 'nexmo-video' },
      { name: 'nexmo-voice-inspector' },
      { name: 'nexmo-adp' },
      { name: 'nexmo-numintel-insight' },
      { name: 'vgai-rag-api' },
      { name: 'nexmo-rtc' },
      { name: 'nexmo-kyc' },
    ],
    {}
  ),

  appsMetadata:: appsMetadata,
}
