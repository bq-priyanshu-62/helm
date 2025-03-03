local utils = import 'lib/utils.libsonnet';

(import './us.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-verify': utils._RouteConfig(
        activeRevision='5c0da86a9e2fb7afabb4144af009c2f0f4fd8ba9',
        passiveRevision='5c0da86a9e2fb7afabb4144af009c2f0f4fd8ba9',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-tts': utils._RouteConfig(
        activeRevision='83cf09f7636beb0d29b6d6864108a5bc7cb07a22',
        passiveRevision='83cf09f7636beb0d29b6d6864108a5bc7cb07a22',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'nexmo-domains-service': utils._RouteConfig(
        activeRevision='12a95f3f371cb27699fedb39070b7b26f4725b04',
        passiveRevision='12a95f3f371cb27699fedb39070b7b26f4725b04',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-vapi': utils._RouteConfig(
        activeRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-capi': utils._RouteConfig(
        activeRevision='7bc5b593b4c01015d29ca033b3abd5edea7a411e',
        passiveRevision='7bc5b593b4c01015d29ca033b3abd5edea7a411e',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-conversations': utils._RouteConfig(
        activeRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-conversations-v01': utils._RouteConfig(
        activeRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-conversations-v02': utils._RouteConfig(
        activeRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-conversations-v03': utils._RouteConfig(
        activeRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'vgai-rag-api': utils._RouteConfig(
        activeRevision='dd30b26f2e18416a41b183fa71fbe8ac0f9e1295',
        passiveRevision='dd30b26f2e18416a41b183fa71fbe8ac0f9e1295',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
    },
  },
}
