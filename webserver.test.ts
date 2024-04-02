import { expect, test } from "bun:test";
import { createAndStartWebserver } from "./webserver";
import {
  logoutMutation,
  returnErrorQuery,
  userOne,
  userQuery,
  usersQuery,
  userTwo,
  userVariables,
} from "./ExampleSchemas";
import {
  FETCH_ERROR,
  GRAPHQL_ERROR,
  INVALID_SCHEMA_ERROR,
  METHOD_NOT_ALLOWED_ERROR,
  MISSING_QUERY_PARAMETER_ERROR,
  SCHEMA_VALIDATION_ERROR,
  SYNTAX_ERROR,
  VALIDATION_ERROR,
} from "@dreamit/graphql-server-base";

test("Test webserver", async () => {
  const webserver = createAndStartWebserver();
  // Get initial metrics
  let response = await fetch("http://localhost:3000/metrics");
  let responseAsText = await response.text();
  expect(responseAsText).toContain(
    "graphql_server_availability 1",
  );

  expect(responseAsText).toContain(
    "graphql_server_request_throughput 0",
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${GRAPHQL_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${SCHEMA_VALIDATION_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${FETCH_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${METHOD_NOT_ALLOWED_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${INVALID_SCHEMA_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${MISSING_QUERY_PARAMETER_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${VALIDATION_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${SYNTAX_ERROR}"} 0`,
  );

  // Get all users
  response = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    body: JSON.stringify({ query: usersQuery }),
    headers: { "Content-Type": "application/json" },
  });
  let responseAsJson = await response.json();
  expect(responseAsJson.data.users).toEqual([userOne, userTwo]);

  // Get user one
  response = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: userQuery,
      variables: JSON.parse(userVariables),
    }),
    headers: { "Content-Type": "application/json" },
  });
  responseAsJson = await response.json();
  expect(responseAsJson.data.user).toEqual(userOne);

  // Get user two
  response = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    body: JSON.stringify({ query: userQuery, variables: { "id201": "2" } }),
    headers: { "Content-Type": "application/json" },
  });
  responseAsJson = await response.json();
  expect(responseAsJson.data.user).toEqual(userTwo);

  // Get unknown user
  response = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    body: JSON.stringify({ query: userQuery, variables: { "id201": "3" } }),
    headers: { "Content-Type": "application/json" },
  });
  responseAsJson = await response.json();
  expect(responseAsJson.errors[0].message).toBe(
    "User for userid=3 was not found",
  );

  // Get returnError response
  response = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    body: JSON.stringify({ query: returnErrorQuery }),
    headers: { "Content-Type": "application/json" },
  });
  responseAsJson = await response.json();
  expect(responseAsJson.errors[0].message).toBe("Something went wrong!");

  // Get logout mutation response
  response = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    body: JSON.stringify({ query: logoutMutation }),
    headers: { "Content-Type": "application/json" },
  });
  responseAsJson = await response.json();
  expect(responseAsJson.data.logout).toEqual({ result: "Goodbye!" });

  // Get final metrics
  response = await fetch("http://localhost:3000/metrics");
  responseAsText = await response.text();
  expect(responseAsText).toContain(
    "graphql_server_availability 1",
  );
  expect(responseAsText).toContain(
    "graphql_server_request_throughput 6",
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${GRAPHQL_ERROR}"} 2`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${SCHEMA_VALIDATION_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${FETCH_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${METHOD_NOT_ALLOWED_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${INVALID_SCHEMA_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${MISSING_QUERY_PARAMETER_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${VALIDATION_ERROR}"} 0`,
  );
  expect(responseAsText).toContain(
    `graphql_server_errors{errorClass="${SYNTAX_ERROR}"} 0`,
  );
  webserver.stop(true);
});
