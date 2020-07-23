FROM neo4j:4.0.4

ENV NEO4J_AUTH neo4j/nC1aB4mji623s2Zs
ENV NEO4JLABS_PLUGINS "[\"apoc\"]"
ENV NEO4J_dbms_memory_pagecache_size 4G
ENV NEO4J_dbms_memory_heap_max__size 4G
ENV NEO4J_dbms_security_procedures_unrestricted=gds.*,apoc.*
ENV NEO4J_dbms_security_procedures_whitelist=gds.*,apoc.*

ADD ./db/neo4j/plugins /plugins/
