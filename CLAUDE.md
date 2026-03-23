# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build (compiles TypeScript to .build/, strips test files)
npm run build

# Lint + unit tests
npm test

# Unit tests only
npm run test:unit

# Integration tests (requires live DynamoDB)
npm run test:int

# Smoke tests (post-transpile validation)
npm run test:smoke

# Run a single test file
npx jest test/constructor.unit.test.ts --silent

# Run a single test by name
npx jest test/constructor.unit.test.ts -t "should succeed" --silent
```

## Architecture

This is a DynamoDB repository library (`@setho/dynamodb-repository`) designed for AWS Lambda use cases. It exports a single class `KeyValueRepository` that wraps DynamoDB Document Client v3 with CRUD operations, automatic ID/timestamp management, and optimistic locking.

**Constructor** requires `tableName`, `keyName`, and `documentClient` (DynamoDB `DynamoDBDocumentClient`). Optional `idOptions` configures an ID prefix and separator (e.g., `ITEM_` or `ITEM#`).

**Five public methods:** `create`, `get`, `getMany` (cursor pagination), `remove`, `update`.

**Key behaviors:**

- `create` auto-generates a ULID-based ID, sets `createdAt`/`updatedAt` (ISO-8601), and `revision: 1`
- `update` performs partial updates with optimistic locking — increments `revision`, throws 409 on conflict, 404 if not found
- `get` throws 404 if not found
- `getMany` returns `{ items, cursor }` using base64-encoded DynamoDB `LastEvaluatedKey`

**Source layout:**

- `lib/keyValueRepository.ts` — core class
- `lib/updateExpressionBuilder.ts` — builds DynamoDB `UpdateExpression` + attribute maps for partial updates
- `lib/utils.ts` — ID/cursor creation, DynamoDB key construction
- `lib/validator.ts` — Joi-based constructor arg validation
- `lib/types.ts` — TypeScript types

**Test infrastructure** (`test/`):

- `documentClient.ts` — singleton `DynamoDBDocumentClient` for integration tests (us-east-1)
- `integrationTestUtils.ts` — helpers for inserting/fetching/removing test items; uses `async-retry` for eventual consistency
- Unit tests mock the DocumentClient; integration tests hit a real table
