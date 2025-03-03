import { loadEnv } from './load.config';
import { StatusCodes } from 'http-status-codes';
const request = require('syncrequest');
const retry = require('retry');

const [environment, region, cluster] = process.env.NODE_ENV.split('.');

const runRegion = process.env.RUN_REGION;
const runGlobal = process.env.RUN_GLOBAL;
const primaryDomainTest = process.env.PRIMARY_ONLY === 'false' ? false : true;

const sleep = milliseconds => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);

const envConf: any = loadEnv();
export const glooConf = envConf.gloo;
export const regionConf = glooConf.regions[region];
export const servicesConf = envConf.services;
export const selectedRegion = region;
export const selectedEnv = environment;
export const selectedCluster = cluster;

export function getHostDomainsList(hostDomains: object): string[] {
  const hosts: string[] = [];

  if (!hostDomains) {
    return hosts;
  }

  hosts.push(...hostDomains['host'].primary);

  if (!primaryDomainTest && hostDomains['host'].secondary) {
    hosts.push(...hostDomains['host'].secondary);
  }

  return hosts;
}

export function getAllUniqueAppHostDomains() {
  const hosts: string[] = [];

  //tokbox
  hosts.push(...getHostDomainsList(servicesConf.api['tokbox']?.[selectedRegion]));
  //tokboxTools
  hosts.push(...getHostDomainsList(servicesConf.api['tokboxTools']?.[selectedRegion]));
  //nexmoTools
  hosts.push(...getHostDomainsList(servicesConf.api['nexmoTools']?.[selectedRegion]));
  //dashboard
  hosts.push(...getHostDomainsList(servicesConf.api['dashboard']?.[selectedRegion]));
  //10dlc
  hosts.push(...getHostDomainsList(servicesConf.api['tendlc']?.host[selectedRegion]));
  //numberpool
  hosts.push(...getHostDomainsList(servicesConf.api['numberpool']?.host[selectedRegion]));
  //applications
  hosts.push(...getHostDomainsList(servicesConf.api['applications']?.host[selectedRegion]));
  //conversations
  hosts.push(...getHostDomainsList(servicesConf.api['conversations']?.host[selectedRegion]));
  //capi
  hosts.push(...getHostDomainsList(servicesConf.api['capi']?.host[selectedRegion]));
  //messagesaws
  hosts.push(...getHostDomainsList(servicesConf.api['messagesaws']?.host[selectedRegion]));
  hosts.push(...getHostDomainsList(servicesConf.api['messagesaws']?.sandboxHost[selectedRegion]));
  hosts.push(...getHostDomainsList(servicesConf.api['messagesaws']?.wamHost[selectedRegion]));
  hosts.push(...getHostDomainsList(servicesConf.api['messagesaws']?.wamApiHost[selectedRegion]));
  hosts.push(...getHostDomainsList(servicesConf.api['messagesaws']?.chatappmo[selectedRegion]));
  hosts.push(...getHostDomainsList(servicesConf.api['messagesaws']?.rcsManagerHost[selectedRegion]));
  //auth
  hosts.push(...getHostDomainsList(servicesConf.api['auth'][selectedRegion]));
  //quotaCheck
  hosts.push(...getHostDomainsList(servicesConf.api['quotaCheck']?.[selectedRegion]));
  //directresponse
  hosts.push(...getHostDomainsList(servicesConf.api['directresponse']?.[selectedRegion]));
  //ignoreAuth
  hosts.push(...getHostDomainsList(servicesConf.api['ignoreAuth']?.[selectedRegion]));
  //forceAuth
  hosts.push(...getHostDomainsList(servicesConf.api['forceAuth']?.[selectedRegion]));
  //boost
  hosts.push(...getHostDomainsList(servicesConf.api['boost']?.[selectedRegion]));
  //cost
  hosts.push(...getHostDomainsList(servicesConf.api['cost']?.[selectedRegion]));
  //redact
  hosts.push(...getHostDomainsList(servicesConf.api['redact']?.[selectedRegion]));
  //conversions
  hosts.push(...getHostDomainsList(servicesConf.api['conversions']?.[selectedRegion]));
  //auditevent
  hosts.push(...getHostDomainsList(servicesConf.api['auditevent']?.[selectedRegion]));
  //cs-ips
  hosts.push(...getHostDomainsList(servicesConf.api['cs-ips']?.[selectedRegion]));
  //push
  hosts.push(...getHostDomainsList(servicesConf.api['push']?.[selectedRegion]));
  //phub-prov
  hosts.push(...getHostDomainsList(servicesConf.api['phub-prov']?.[selectedRegion]));
  //phub-pools
  hosts.push(...getHostDomainsList(servicesConf.api['phub-pools']?.[selectedRegion]));
  //accounts-secrets
  hosts.push(...getHostDomainsList(servicesConf.api['accounts-secrets']?.[selectedRegion]));
  //reports
  hosts.push(...getHostDomainsList(servicesConf.api['reports']?.[selectedRegion]));
  //partnerapi
  hosts.push(...getHostDomainsList(servicesConf.api['partnerapi']?.[selectedRegion]));
  //vapi
  hosts.push(...getHostDomainsList(servicesConf.api['vapi']?.[selectedRegion]));
  //vapi_payment_controller
  hosts.push(...getHostDomainsList(servicesConf.api['vapi_payment_controller']?.[selectedRegion]));
  //tts
  hosts.push(...getHostDomainsList(servicesConf.api['tts']?.[selectedRegion]));
  //domains_service
  hosts.push(...getHostDomainsList(servicesConf.api['domains_service']?.[selectedRegion]));
  //emergency-number-addr-prov
  hosts.push(...getHostDomainsList(servicesConf.api['emergency-number-addr-prov']?.[selectedRegion]));
  //address-prov
  hosts.push(...getHostDomainsList(servicesConf.api['address-prov']?.[selectedRegion]));
  //media
  hosts.push(...getHostDomainsList(servicesConf.api['media']?.[selectedRegion]));
  //verify
  hosts.push(...getHostDomainsList(servicesConf.api['verify']?.[selectedRegion]));
  //verify_v2
  hosts.push(...getHostDomainsList(servicesConf.api['verify_v2']?.[selectedRegion]));
  //verify_v2_provisioning
  hosts.push(...getHostDomainsList(servicesConf.api['verify_v2_provisioning']?.[selectedRegion]));
  //chatapp-orchestrator
  hosts.push(...getHostDomainsList(servicesConf.api['chatapp_orchestrator']?.[selectedRegion]));
  //velocity_rules
  hosts.push(...getHostDomainsList(servicesConf.api['velocity_rules']?.[selectedRegion]));
  //docs
  hosts.push(...getHostDomainsList(servicesConf.api['docs']?.[selectedRegion]));
  //blog
  hosts.push(...getHostDomainsList(servicesConf.api['blog']?.[selectedRegion]));
  //devapi_rest
  hosts.push(...getHostDomainsList(servicesConf.api['devapi_rest']?.[selectedRegion]));
  //ni
  hosts.push(...getHostDomainsList(servicesConf.api['ni']?.[selectedRegion]));
  //niV2
  hosts.push(...getHostDomainsList(servicesConf.api['niV2']?.[selectedRegion]));
  //ni_rest
  hosts.push(...getHostDomainsList(servicesConf.api['ni_rest']?.[selectedRegion]));
  //utilities
  hosts.push(...getHostDomainsList(servicesConf.api['utilities']?.host[selectedRegion]));
  //sms_rest
  hosts.push(...getHostDomainsList(servicesConf.api['sms_rest']?.[selectedRegion]));
  //sms_api
  hosts.push(...getHostDomainsList(servicesConf.api['sms_api']?.[selectedRegion]));
  //5g-slice
  hosts.push(...getHostDomainsList(servicesConf.api['5gSlice']?.[selectedRegion]));
  //admin-5g-slice
  hosts.push(...getHostDomainsList(servicesConf.api['Admin5gSlice']?.[selectedRegion]));
  //meetings
  hosts.push(...getHostDomainsList(servicesConf.api['meetings']?.[selectedRegion]));
  //vbc_meetings
  hosts.push(...getHostDomainsList(servicesConf.api['vbc_meetings']?.[selectedRegion]));
  //vcp_bulk
  hosts.push(...getHostDomainsList(servicesConf.api['vcp_bulk']?.[selectedRegion]));
  //chat
  hosts.push(...getHostDomainsList(servicesConf.api['chat']?.[selectedRegion]));
  //chat-media
  hosts.push(...getHostDomainsList(servicesConf.api['chat-media']?.[selectedRegion]));
  //bus
  hosts.push(...getHostDomainsList(servicesConf.api['bus']?.[selectedRegion]));
  //credentials
  hosts.push(...getHostDomainsList(servicesConf.api['credentials']?.[selectedRegion]));
  //enforcer-service
  hosts.push(...getHostDomainsList(servicesConf.api['enforcer-service']?.[selectedRegion]));
  //fd-alerts-generator
  hosts.push(...getHostDomainsList(servicesConf.api['fd-alerts-generator']?.[selectedRegion]));
  //rag
  hosts.push(...getHostDomainsList(servicesConf.api['vgai-rag-api']?.[selectedRegion]));
  //number-inventory
  hosts.push(...getHostDomainsList(servicesConf.api['number-inventory']?.[selectedRegion]));
  //email
  hosts.push(...getHostDomainsList(servicesConf.api['email']?.[selectedRegion]));

  const uniqueHosts = Array.from(new Set(hosts));

  return uniqueHosts;
}

export function getHostList(lob: string, app: string | null = null): string[] {
  const hosts: any = [];

  if (cluster) {
    if (!['c1', 'c2', 'cactive', 'active'].includes(cluster.toLowerCase())) {
      throw 'invalid cluster value';
    }

    if (cluster.toLowerCase().includes('active')) {
      hosts.push(regionConf.clusters.active.domain);
    } else {
      hosts.push(regionConf.clusters[cluster].domain);
    }
  } else {
    // throw new Error('You have to specify the sanity cluster to test');
    // todo: find a way to test both active & passive clusters
    // Object.keys(regionConf.clusters).forEach(cluster => {
    //   hosts.push(
    //     `${regionConf.clusters[cluster][lob].domain}` + `${regionConf.clusters[cluster].port ? ':' + regionConf.clusters[cluster].port : ''}`,
    //   );
    // });
  }

  if (runRegion) {
    hosts.push(regionConf[lob].domain);
  }

  if (runGlobal) {
    hosts.push(glooConf[lob].domain);
  }

  hosts.push(...getServiceHosts(lob, app));
  return hosts;
}

function getServiceHosts(lob: string, app: string): string[] {
  const lobDomains = servicesConf[lob]?.domains;
  const appDomains = servicesConf[lob][app]?.domains;

  const list: string[] = [];
  if (runRegion) {
    if (lobDomains?.regions && lobDomains?.regions[region]) {
      list.push(...lobDomains?.regions[region]);
    }
    if (appDomains?.regions && appDomains?.regions[region]) {
      list.push(...appDomains?.regions[region]);
    }
  }

  if (runGlobal) {
    if (lobDomains?.global) {
      list.push(...lobDomains.global);
    }
    if (appDomains?.global) {
      list.push(...appDomains.global);
    }
  }

  return list;
}
