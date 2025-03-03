local utils = import 'lib/utils.libsonnet';

(import './ap.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
      'nexmo-verify': utils._RouteConfig(
        activeRevision='5c0da86a9e2fb7afabb4144af009c2f0f4fd8ba9',
        passiveRevision='5c0da86a9e2fb7afabb4144af009c2f0f4fd8ba9',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
      ),
      'nexmo-tts': utils._RouteConfig(
        activeRevision='e24d01d6a2f426bc31a604f010f2f3870123c8d2',
        passiveRevision='c2d6b1d4307db6ea1cbf9e9785558b856321c968',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive,
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
      'nexmo-vapi': utils._RouteConfig(
        activeRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        passiveRevision='87cfa3c969985f8e03f6e942694afd8351d0fc82',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-capi': utils._RouteConfig(
        activeRevision='cd0d3d9aea9538c34d6d1d0483c7d0c7dc561e9a',
        passiveRevision='cd0d3d9aea9538c34d6d1d0483c7d0c7dc561e9a',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
      'nexmo-domains-service': utils._RouteConfig(
        activeRevision='12a95f3f371cb27699fedb39070b7b26f4725b04',
        passiveRevision='12a95f3f371cb27699fedb39070b7b26f4725b04',
        routeLibVersion=$._routeLibVersion,
        passiveRouteLibVersion=$._routeLibVersionPassive
      ),
    },
  },
}
