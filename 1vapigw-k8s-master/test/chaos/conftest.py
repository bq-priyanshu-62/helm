"""
* (c) Copyright Vonage. All Rights Reserved.
* These materials are unpublished, proprietary, confidential source code of
* Vonage and constitute a TRADE SECRET of Vonage.
* Vonage retains all titles to an intellectual property rights in these materials.
"""


def pytest_addoption(parser):
    """
    This is a pytest hook called at the start of pytest. Stores the command line arguments as
    pytest options, allowing default values.
    :param parser: A pytest object.
    :return:
    """
    parser.addoption("--threads", action="store", default="1")
    parser.addoption("--domain", action="store", default="gw-euw1-sanity.api-eu.qa.v1.vonagenetworks.net")
    parser.addoption("--duration", action="store", default="120")
    parser.addoption("--delay", action="store", default="30")


def pytest_generate_tests(metafunc):
    """
    This is a pytest hook called for every test during collection. Parameterise each test using the
    pytest options, namely options passed in from the command line.
    :param metafunc: A pytest object.
    :return:
    """
    threads_option_value = metafunc.config.option.threads
    if 'threads' in metafunc.fixturenames and threads_option_value is not None:
        metafunc.parametrize("threads", [int(threads_option_value)])

    domain_option_value = metafunc.config.option.domain
    if 'domain' in metafunc.fixturenames and domain_option_value is not None:
        metafunc.parametrize("domain", [domain_option_value])

    duration_option_value = metafunc.config.option.duration
    if 'duration' in metafunc.fixturenames and duration_option_value is not None:
        metafunc.parametrize("duration", [int(duration_option_value)])

    delay_option_value = metafunc.config.option.delay
    if 'delay' in metafunc.fixturenames and delay_option_value is not None:
        metafunc.parametrize("delay", [int(delay_option_value)])

