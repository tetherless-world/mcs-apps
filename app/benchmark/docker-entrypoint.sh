#!/bin/bash
set -e
curl -q --retry 10 --retry-connrefused --retry-max-time 120 -s http://neo4j:7474
/app/bin/mcs-benchmark-app -Dhttp.port=80
