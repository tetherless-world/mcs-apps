# Machine Common Sense applications

Web applications for exploring knowledge graphs of common sense, benchmark questions, and question-answering processes.

This work is supported by the [DARPA Machine Common Sense (MCS)](https://www.darpa.mil/program/machine-common-sense") program.

# Knowledge graph application

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)
* A CSKG release (`edges.csv` and `nodes.csv`)

## Loading the database

If the neo4j database is empty, the application Docker container looks for data in the container's `/data` directory. The `docker-compose.yml` mounts the `/data/kg` directory on the host to `/data` in the container.

Currently the data must be in in [KGTK](https://github.com/usc-isi-i2/kgtk) edges format and have the file extension `.tsv`:

    mv ~/cskg.tsv ./data/kg

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
* datasource
* label

You can specify Lucene-style queries such as `id:"someid"` or `datasource:somedatasource` or some combination thereof.

# Development

The applications have a standard three-tier architecture:
- Database: neo4j
- Middleware: Play framework web application in Scala
- Front end: TypeScript+React

## Structure of this repository

The repository is organized to support code reuse between applications. It is easier to share code in some areas than in others.

### `.circleci`

This directory contains the [CircleCI](https://circleci.com/) build configuration.

### `app`

This directory contains the middleware for the different applications as well as Dockerfiles for building them.

For example, in `app/kg/app` you find:

* `app`: Play middleware source
* `conf` contains the Play middleware configuration
* `Dockerfile`: Docker image build script for both the Play middleware and the associated front end, which are baked into the same image for ease of distribution
* `test`: unit tests for the Play middleware

### `db`

This directory contains Docker image specifications (Dockerfiles) for databases used by the applications, such as `neo4j`.

### `gui`

This directory contains front ends for the different applications.

The front end stack has relatively poor support for packaging code in libraries. I tried permutations such as:
* multiple entry points in a single webpack.config.js. Plugins such as the HtmlWebpackPlugin do not support multiple entry points well.
* common code in libraries, using [lerna](https://github.com/lerna/lerna) to manage cross-dependencies. This approach ran into issues exporting `.graphql` parsed documents from libraries. It is worth trying again once the code bases are better separated. 

The current setup is:
* a single `package.json` with dependencies for all front ends
* prefixed `scripts` (e.g., `build-kg`) for each front end in the `package.json`
* one `webpack.config.js` for each front end
* one `dist/` subdirectory for each front end's outputs

### `integration`

This directory contains [Cypress](https://www.cypress.io/) integration tests for all applications.

The tests for the different applications are side-by-side in the directory tree because the CircleCI+Cypress integration is designed to use only a single Cypress installation (`cypress/install` job) per workflow. Having multiple workflows was a possibility, but would come at the expense of additional complexity in the CircleCI configuration and possibly redundant builds.

### `lib`

This directory contains libraries that can be reused by different applications. It is further subdivided by language, `scala` for middleware and `ts` for front ends.

### `script`

This directory contains scripts for manipulating Docker containers and other administrative tasks.

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

    sbt "project kgApp" run
    
or in the sbt shell. The app listens to port 9000. It expects to be able to reach the database via the Bolt protocol at `neo4j:7687`.

#### Running with test data

The app can use an in-memory test data store (`MemStore`) with synthetic data in lieu of connecting to neo4j:

    sbt "project kgApp" -DtestIntegration run
    
The same system property can be set in an IntelliJ run configuration.

Integration testing uses this test data store instead of neo4j.

## Front end

### Installing dependencies

Before running the front end for the first time you must install its dependencies:

    cd gui
    npm install

You should also run this command when the dependencies listed in the `package.json` are updated. If there are build errors on the `master` branch on your system it's often because dependencies are missing.

### Running

The front end is built with webpack. To start the webpack-dev-server, run

    cd gui
    npm start-kg
    
from the root of the repository. The webpack-dev-server listens to port 9001 and proxies API requests to port 9000.

You can then open the app on

    http://localhost:9001
