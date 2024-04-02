import { GraphQLServer, JsonLogger } from "@dreamit/graphql-server";
import { userSchema, userSchemaResolvers } from "./ExampleSchemas";
import type { Server } from "bun";

export function createAndStartWebserver(): Server {

  const graphqlServer = new GraphQLServer(
    {
        schema: userSchema,
        rootValue: userSchemaResolvers,
        logger: new JsonLogger('bun-server', 'user-service')
    }
  )
  
  const server = Bun.serve({
      port: 3000,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/metrics") {
          const metricsResponse = await graphqlServer.getMetrics()
          return new Response(metricsResponse, {headers: 
           {
            'content-type':  graphqlServer.getMetricsContentType() 
           }
          });
        } else if (url.pathname === "/graphql") {
          let jsonBody = undefined
        try {
          jsonBody = await req.json()
        } catch (error) {
          console.log('Cannot read body as json', error)
        }
  
        const result = await graphqlServer.handleRequest({
          //TODO: Check how req.headers can be used 
          headers: {'content-type': 'application/json'},
          url: req.url,
          body: jsonBody,
          method: req.method,
        })         
        return new Response(JSON.stringify(result.executionResult));
        }
        return new Response(undefined, {status: 404});
      },
    });
    
  console.log(`Listening on http://localhost:${server.port} ...`);
  return server
}
