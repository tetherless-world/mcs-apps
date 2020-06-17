# Machine Common Sense portal

Portal for exploring knowledge graphs of common sense, benchmark questions, and question-answering processes.

This work is supported by the [DARPA Machine Common Sense (MCS)](https://www.darpa.mil/program/machine-common-sense") program.

# Running the application

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)

## Starting the application

In the current directory:

    docker-compose up
    
## Clearing the database (if previously loaded)    

The Docker setup uses Neo4j Community Edition. The only way to quickly and reliably clear a Community Edition database is to stop the neo4j container and delete its backing data. There is a script to do this:

    script/delete-neo4j-data

## Loading the database

After starting the application, copy a CSKG `nodes.csv` and `edges.csv` into `data/app/import`.
 
Then run:

    script/import-cskg-nodes

The middleware will log its progress to the console.

When the nodes are done importing, run:

    script/import-cskg-edges
        
## Viewing the application

After starting the application and loading the data, open your browser to [http://localhost:8080](http://localhost:8080).

# Using the application

## Searching for nodes

The navbar searchbox searches for nodes using full-text search. By default it searches across all of a node's indexed attributes, which currently (2020601) include:

* id
* datasource
* label

You can specify Lucene-style queries such as `id:"someid"` or `datasource:somedatasource` or some combination thereof.

# Developing

The portal is a standard three-tier web application:
- Database: neo4j
- Middleware: Play framework web application in Scala
- Front end: TypeScript+React

## Database

### Running the database locally

You can run the neo4j database locally with Docker:

    docker-compose up neo4j
    
Then following the steps above to bootstrap (one time) and load the database.
    
### Using the shared database (RPI only)

There is a shared neo4j instance on the RPI network at `128.113.12.49`. In order to use this, add an entry to your `/etc/hosts` file (or Windows equivalent) mapping that IP to the name `neo4j`:
    
## Middleware

### Prerequisites

* [Java Development Kit (JDK)](https://adoptopenjdk.net/)
* [sbt](https://www.scala-sbt.org/)

### Running

The Play app can be run in the usual way. From the root of the repository:

    sbt run
    
or in the sbt shell. The app listens to port 9000. It expects to be able to reach the database via the Bolt protocol at `neo4j:7687`.

#### Running with test data

The app can use an in-memory test data store (`MemStore`) with synthetic data in lieu of connecting to neo4j:

    sbt -DtestIntegration run
    
The same system property can be set in an IntelliJ run configuration.

Integration testing uses this test data store instead of neo4j.

### Front end

The front end is built with webpack. To start the webpack-dev-server, run

    cd gui
    npm start
    
from the root of the repository. The webpack-dev-server listens to port 9001 and proxies API requests to port 9000.

You can then open the app on

    http://localhost:9001
