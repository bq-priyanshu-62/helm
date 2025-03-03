"""
* (c) Copyright Vonage. All Rights Reserved.
* These materials are unpublished, proprietary, confidential source code of
* Vonage and constitute a TRADE SECRET of Vonage.
* Vonage retains all titles to an intellectual property rights in these materials.
"""

from imghdr import tests
from threading import Thread
import pytest
import time
import requests
import boto3
import json
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig
from requests import codes

pytestmark = pytest.mark.chaos_tests

ROUTE_LOAD_PROTECTED = "https://{}/gateway/load-protected"

PARAMS = {
}

NOCACHE_PARAMS = {
}

class PropagatingThread(Thread):
    def run(self):
        self.exc = None
        try:
            if hasattr(self, '_Thread__target'):
                responseCodes, errorSet = self._Thread__target(*self._Thread__args, **self._Thread__kwargs)
                self.ret = responseCodes
                self.errs = errorSet
            else:
                responseCodes, errorSet = self._target(*self._args, **self._kwargs)
                self.ret = responseCodes
                self.errs = errorSet
        except BaseException as e:
            self.exc = e

    def join(self, timeout=None):
        super(PropagatingThread, self).join(timeout)
        if self.exc:
            raise self.exc
        return self.ret

def loadCredentials():
    # Get credentials
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name="eu-west-1",
    )
    get_secret_value_response = client.get_secret_value(
        SecretId="gatewaytest/credentials"
    )
    secret=get_secret_value_response['SecretString']
    secretJson=json.loads(secret)
    PARAMS["api_key"]=secretJson['api-hasQuotaAccount']
    PARAMS["api_secret"]=secretJson['api-hasQuotaPassword']
    NOCACHE_PARAMS["api_key"]=secretJson['api-chaosAccount']
    NOCACHE_PARAMS["api_secret"]=secretJson['api-chaosPassword']


def print_response_codes(responseCodes):
    print("status codes")
    print("STATUS CODE  :   COUNT")

    for key, value in responseCodes.items():
        print("     {}     :    {}".format(key, value))

    print("-----------------------------------")


def print_errors(errorSet):
    if len(errorSet) > 0:
        print("")
        print("ERRORS")

        for err in errorSet:
            print(err)

        print("-----------------------------------")


def parse_response(response):
    try:
        if 'title' in response.json():
            return str(response.status_code) + " : " + str(response.json()['title'])
        else:
            return str(response.status_code) + " : " + response.text
    except:
        return str(response.status_code) + " : " + response.text


def error_percent(responseCodes, errorCode):
    total = 0

    for key in responseCodes.keys():
        total += responseCodes[key]
    
    if errorCode in responseCodes.keys():
        return (responseCodes[errorCode] / total) * 100
    else:
        return 0

def send_request(url, durationSecs, delay, cacheTest = True):
    start_time = time.time()
    responseCodes = {}
    errorSet = set()

    while True:
        current_time = time.time()
        elapsed_time = current_time - start_time
        params = None

        if cacheTest:
            params = PARAMS
        else:
            params = NOCACHE_PARAMS

        resp = requests.get(url, params=params)
        responseCodes[resp.status_code] = responseCodes.get(resp.status_code, 0) + 1

        if(resp.status_code != codes['ok']):
            errorSet.add(parse_response(resp))

        if elapsed_time < delay and resp.status_code != codes['ok']:
            raise AssertionError("error response before chaos event: " + resp.text)
            
        if elapsed_time > durationSecs:
            break;
    
    return responseCodes, errorSet


def initiate_threads(threads, url, duration, delay, network = False):
    allThreads = []
    networkThreads = []
    responseCodes = {}
    errorSet = set()

    for count in range(threads):
        allThreads.append(PropagatingThread(target=send_request, args=(url, duration, delay)))
    
    for thread in allThreads:
        thread.start()

    if network:
        time.sleep(delay + 20)
        
        for count in range(threads):
            networkThreads.append(PropagatingThread(target=send_request, args=(url, 30, 0, False)))
        
        for thread in networkThreads:
            thread.start()
        
        for thread in networkThreads:
            thread.join()
        
        for thread in networkThreads:
            errorSet.update(thread.errs)

            for key in thread.ret.keys():
                responseCodes[key] = responseCodes.get(key, 0) + thread.ret[key]

    for thread in allThreads:
        thread.join()
    
    for thread in allThreads:
        errorSet.update(thread.errs)

        for key in thread.ret.keys():
            responseCodes[key] = responseCodes.get(key, 0) + thread.ret[key]
    
    return responseCodes, errorSet


@pytest.mark.identity_pod_failure
def test_identity_chaos_pod_failure_simulation(threads, domain, duration, delay):
    responseCodes, errorSet = initiate_threads(threads, ROUTE_LOAD_PROTECTED.format(domain), duration, delay)
    print_response_codes(responseCodes)
    print_errors(errorSet)
    assert all(code == 200 for code in responseCodes.keys()), responseCodes
    assert len(errorSet) == 0, errorSet


@pytest.mark.identity_pod_kill
def test_identity_chaos_pod_kill_simulation(threads, domain, duration, delay):
    responseCodes, errorSet = initiate_threads(threads, ROUTE_LOAD_PROTECTED.format(domain), duration, delay)
    print_response_codes(responseCodes)
    print_errors(errorSet)
    assert all(code in [200, 403] for code in responseCodes.keys()), responseCodes
    assert error_percent(responseCodes, 403) < 0.5, "403 response percentage is high"


@pytest.mark.identity_container_kill
def test_identity_chaos_container_kill_simulation(threads, domain, duration, delay):
    responseCodes, errorSet = initiate_threads(threads, ROUTE_LOAD_PROTECTED.format(domain), duration, delay)
    print_response_codes(responseCodes)
    print_errors(errorSet)
    assert all(code in [200, 403] for code in responseCodes.keys()), responseCodes
    assert error_percent(responseCodes, 403) < 3.5, "403 response percentage is high"


@pytest.mark.gw_proxy_pod_failure
def test_gw_proxy_chaos_pod_failure_simulation(threads, domain, duration, delay):
    responseCodes, errorSet = initiate_threads(threads, ROUTE_LOAD_PROTECTED.format(domain), duration, delay)
    print_response_codes(responseCodes)
    print_errors(errorSet)
    assert all(code == 200 for code in responseCodes.keys()), responseCodes
    assert len(errorSet) == 0, errorSet


@pytest.mark.gw_proxy_pod_kill
def test_gw_proxy_chaos_pod_kill_simulation(threads, domain, duration, delay):
    responseCodes, errorSet = initiate_threads(threads, ROUTE_LOAD_PROTECTED.format(domain), duration, delay)
    print_response_codes(responseCodes)
    print_errors(errorSet)
    assert all(code in [200, 502] for code in responseCodes.keys()), responseCodes
    assert error_percent(responseCodes, 502) < 0.3, "502 response percentage is high"


@pytest.mark.gw_proxy_container_kill
def test_gw_proxy_chaos_container_kill_simulation(threads, domain, duration, delay):
    responseCodes, errorSet = initiate_threads(threads, ROUTE_LOAD_PROTECTED.format(domain), duration, delay)
    print_response_codes(responseCodes)
    print_errors(errorSet)
    assert all(code in [200, 502] for code in responseCodes.keys()), responseCodes
    assert error_percent(responseCodes, 502) < 0.3, "502 response percentage is high"


if __name__ == "__main__":
    loadCredentials()
    pytest.main([__file__, "-k", "test_", "-v", "-s", "-x"])
