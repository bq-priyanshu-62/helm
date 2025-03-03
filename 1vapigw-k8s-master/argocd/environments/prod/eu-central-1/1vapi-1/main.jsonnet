local config = import 'cluster.jsonnet';
local main = import 'lib/gateway/main.libsonnet';

local extAppGroup = std.extVar('appsGroup');
main(config, extAppGroup).out
