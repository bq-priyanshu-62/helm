import os
import re
import sys
import time
import json
import hmac
import base64
import hashlib

import requests
from requests import Session
from github import Github


ACTIVE_CLUSTERS_ENDPOINT = os.environ.get('ACTIVE_CLUSTERS_ENDPOINT')
AFFECTED_FILES = os.environ.get('AFFECTED_FILES')
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET')
TIMESTAMP_HEADER = 'X-Request-Timestamp'
SIGNATURE_HEADER = 'X-Vonage-Github-Signature'
GITHUB_CONTEXT = os.environ['GITHUB_CONTEXT']
GITHUB_TOKEN = os.environ['GITHUB_TOKEN']


def check_affected_region_clusters_status():
    output = dict()
    pr_num, title, skip_ci = extract_title_from_github_context(GITHUB_CONTEXT)
    output['pr_num'] = pr_num
    output['title'] = title
    if skip_ci:
        msg = 'Skipping CI because the PR title contains [skip ci]'
        output['msg'] = msg
        return output, False

    affected_regions_prod, regex = get_affected_regions_by_file_changes(AFFECTED_FILES, 'prod')

    if len(affected_regions_prod) == 0:
        msg = 'Did not detect a change in files identified by regex: %s' % regex
        output['msg'] = msg
        return output, False

    request_body = {
        'qa': [],
        'prod': affected_regions_prod,
    }

    request = requests.Request(method='POST', url=ACTIVE_CLUSTERS_ENDPOINT, headers={}, json=request_body)
    prepared = request.prepare()
    timestamp = time.time()
    secret_key = base64.b64decode(WEBHOOK_SECRET)
    base_string = f":{timestamp}:{request_body}".encode("utf-8")

    mac = hmac.new(secret_key, msg=base_string, digestmod=hashlib.sha256).hexdigest()
    prepared.headers[TIMESTAMP_HEADER] = str(timestamp)
    prepared.headers[SIGNATURE_HEADER] = mac
    session = Session()
    response = session.send(prepared)

    if response.status_code == 200:
        msg = str(response.content)
        output['msg'] = msg
        has_err = False
    else:
        msg = "Warning: %s" % (str(response.content))
        output['msg'] = msg
        has_err = True
    return output, has_err


def get_affected_regions_by_file_changes(affected_files, env):
    affected_files = json.loads(affected_files)

    affected_clusters_by_region = {}
    regex = 'argocd/environments/%s/([^/]*)/([^/]*)' % env
    for path in affected_files:
        match = re.search(regex, path)
        if match and len(match.groups()) == 2:
            region = match.group(1)
            cluster = match.group(2)
            if not affected_clusters_by_region.get(region):
                affected_clusters_by_region[region] = [cluster]
                continue
            affected_clusters_by_region.get(region).append(cluster)

    affected_clusters_by_region = {v: list(affected_clusters_by_region.get(v)) for v in affected_clusters_by_region}

    return affected_clusters_by_region, regex


def extract_title_from_github_context(github_context):
    context = json.loads(github_context)
    pr_num = -1
    title = None
    repo = context['repository']
    if context['event_name'] == 'pull_request':
        event = context['event']
        pr_num = event['number']
        title = event['pull_request']['title']
    else:
        event = context['event']
        message = event['head_commit']['message']
        match = re.search('#(\d+)', message)
        if match and len(match.groups()) == 1:
            pr_num = int(match.group(1))
            pr = get_pull_request(repo_name=repo, pull_request_id=pr_num)
            title = pr.title
    skip_ci = bool(re.match('(.*\[SKIP-CI\].*)', title))
    return pr_num, title, skip_ci


def get_pull_request(repo_name, pull_request_id):
    """Returns information retrieved from github about the pull request"""

    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pull_request_id)

    return pr


if __name__ == '__main__':
    res, has_error = check_affected_region_clusters_status()
    res['has_error'] = has_error
    output_json = json.dumps(res)
    print(output_json)
    sys.exit(0)
