import boto3
import os
import sys


SECRET_ARN = os.environ["SECRET_ARN"].strip()
SECRET_STRING = os.environ["SECRET_VALUE"]
SECRET_REGION = SECRET_ARN.split(":")[3]
USERNAME = os.environ["BUILD_USERNAME"]

boto3.setup_default_session(region_name=SECRET_REGION)
secret_client = boto3.client("secretsmanager")
iam_client = boto3.client("iam")


def _overriding_resource_policy_exists():
    response = secret_client.get_resource_policy(
        SecretId=SECRET_ARN
    )

    return "ResourcePolicy" in response


def _get_groups_for_user():
    response = iam_client.list_groups_for_user(UserName=USERNAME)
    return [group["GroupName"] for group in response["Groups"]]


def _can_build_user_access_secret():
    # Check if an explicit user exists outside of Okta roles
    try:
        user_response = iam_client.get_user(UserName=USERNAME)
        if "User" not in user_response:
            return False

        # If user exists and is admin group; so can continue.
        groups = _get_groups_for_user()
        if "test-admin" in groups:
            return False

        # Check if user is not an admin but has access to read this secret
        user_arn = user_response["User"]["Arn"]
        response = iam_client.simulate_principal_policy(
            PolicySourceArn=user_arn,
            ActionNames=["secretsManager:getSecretValue"],
            ResourceArns=[SECRET_ARN]
        )
        decisions = [res["EvalDecision"] for res in response["EvaluationResults"]]
        if "allowed" in decisions:
            return True

        return False

    except iam_client.exceptions.NoSuchEntityException:
        return False


def _copy_secret():
    client = boto3.client(
        'secretsmanager'
    )

    response = client.put_secret_value(
        SecretId=SECRET_ARN,
        SecretString=SECRET_STRING
    )

    print(response)

    if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
        print("Secret updated: {}".format(response["ARN"]))
        sys.exit(0)

    print(response)
    sys.exit(1)


def run_main():
    # First check if there are any overriding Resource Policies for this secret
    if _overriding_resource_policy_exists():
        print("Something looks suspicious! AWS SSM secrets should not have resource policies, but this one does.")
        sys.exit(1)

    # Check if the user running the build has an IAM user account in AWS and if it has ADMIN access
    if _can_build_user_access_secret():
        print("Something looks suspicious! This user is not an admin but has access to read this secret.")
        sys.exit(1)

    _copy_secret()


if __name__ == '__main__':
    run_main()
