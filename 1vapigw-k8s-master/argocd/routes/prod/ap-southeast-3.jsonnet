local utils = import 'lib/utils.libsonnet';

(import './ap.jsonnet')
{
  gitTags+: {
    'gloo-nexmo-routes'+: {
    },
  },
}
