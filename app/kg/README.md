# Knowledge graph application

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)
* A CSKG release

## Loading the database

If the neo4j database is empty, the application Docker container looks for data in the container's `/data` directory. The `docker-compose.yml` mounts the `data/kg` directory in this repository (on the host) to `/data` in the container.

Currently the data must be in in [KGTK](https://github.com/usc-isi-i2/kgtk) edges format and have the file extension `.tsv` or `.tsv.bz2`:

    mv ~/cskg.tsv ./data/kg

Progress messages will be printed to the application console as the data loads asynchronously. The loading process currently (20201015) takes around 50 minutes.

## Downloading the application

The latest stable build is available on DockerHub.

In the current directory:

    docker-compose pull kg-app

## Starting the application

In the current directory:

    docker-compose up kg-app neo4j
    
## Clearing the database (if previously loaded)    

The Docker setup uses Neo4j Community Edition. The only way to quickly and reliably clear a Community Edition database is to stop the neo4j container and delete its backing data. There is a script to do this:

    script/delete-neo4j-data
        
## Viewing the application

After starting the application and loading the data, open your browser to [http://localhost:8080](http://localhost:8080).

## Using the application

### Searching for nodes

The navbar searchbox searches for nodes using full-text search. By default it searches across all of a node's indexed attributes, which currently (2020601) include:

* id
* source
* label

You can specify Lucene-style queries such as `id:"someid"` or `source:somedatasource` or some combination thereof.
