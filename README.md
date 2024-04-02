# bun-example

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run start
```
  
This will start a webserver on localhost:3000 with the following routes:
- GET /metrics: Get GraphQLServer metrics
- POST /graphql: Handle GraphQL requests

To run tests:

```bash
bun run test
```

To run tests with coverage (might crash on Windows with version Bun 1.1.0):

```bash
bun run testcov
```