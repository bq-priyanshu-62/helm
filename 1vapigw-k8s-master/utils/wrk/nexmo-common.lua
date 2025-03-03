require "log"

wrk.headers["x-nexmo-trace-id"] = "1vapigw-load-test"
wrk.headers["Authorization"] = "Basic dmVyaWZ5MjM6VmVyaWZ5MjM="
wrk.headers["User-Agent"] = "wrk load test"
