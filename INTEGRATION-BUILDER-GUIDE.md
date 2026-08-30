# Integration Builder UI Guide

This guide explains how the frontend should build a UI that lets users create and edit integrations without hand-writing the full backend payload.

The backend accepts `POST /api/integrations` and `PUT /api/integrations/{id}` with the `IntegrationDefinition` payload. Most complex fields are nested JSON objects or arrays, so the frontend should act as a builder that outputs that final payload.

## Goal

Build a frontend flow where a user can:

1. choose an integration pattern
2. fill guided forms instead of raw JSON
3. preview the final payload
4. create or update the integration
5. optionally run it immediately or run it using a schedule type

## Important Backend Facts

- Use `stepConfig`, not `requestConfig`
  - `requestConfig` exists only as a backend fallback for older records
  - new UI should only read and write `stepConfig`
- `fieldMappings` is a real relational array, not just JSON
  - on update, the backend replaces all mappings with the submitted list
- most config sections are stored as JSON on the backend
  - `scheduleConfig`
  - `authConfig`
  - `responseConfig`
  - `paginationConfig`
  - `storageConfig`
  - `stepConfig`
- `scheduleCron` is legacy fallback only
  - do not show it in the main UI
  - if needed, keep it inside an advanced section

## Recommended UX Strategy

Use a hybrid approach, not only a raw form.

The best UX for this project is:

1. template-first entry
2. step-by-step builder
3. advanced JSON preview/editor

### 1. Template-First Entry

Start the flow by asking: "What kind of integration are you building?"

Recommended templates:

- Range API
  - one request uses `fromDate` and `toDate`
- Single-date API
  - one request per day inside a schedule window
- Full-dump API
  - fetch all data, then filter locally by date
- Multi-step session/token API
  - first step gets a token or session value, second step fetches data
- XML/SOAP API
  - request and response use XML or SOAP, mappings use XPath
- Blank / Advanced
  - start with empty sections

Templates should prefill:

- schedule suggestions
- auth type
- one or two starter steps
- response extraction defaults
- storage defaults
- starter field mappings

### 2. Guided Builder

Use a multi-section builder instead of one giant form.

Recommended sections:

1. Basics
2. Schedule
3. Auth
4. Fetch Steps
5. Response Extraction
6. Storage
7. Field Mappings
8. Review and Save

### 3. Advanced JSON Preview

Always show a read-only payload preview.

Optional advanced mode:

- allow direct JSON editing
- if user edits raw JSON, keep it as an expert-only path
- validate before save

This gives both safe and expert workflows.

## API Endpoints Frontend Should Use

For builder CRUD:

- `GET /api/integrations`
- `GET /api/integrations/{id}`
- `POST /api/integrations`
- `PUT /api/integrations/{id}`
- `DELETE /api/integrations/{id}`
- `PATCH /api/integrations/{id}/enabled?value=true|false`

For execution from UI:

- `POST /api/integrations/{id}/run`
- `POST /api/integrations/{id}/run/schedule?scheduleType=DAILY|MONTHLY|HOURLY`
- `POST /api/integrations/{id}/run/custom`

## What The Final Payload Looks Like

High-level shape:

```json
{
  "clientName": "Client A Orders",
  "brandCode": "CLIA",
  "baseUrl": "https://client-a.example.com/api",
  "enabled": true,
  "scheduleConfig": [],
  "scheduleCron": null,
  "csvFileName": "client_a_orders.csv",
  "outputDirectory": "output/client-a",
  "maxRetries": 2,
  "authConfig": {},
  "responseConfig": {},
  "paginationConfig": {},
  "storageConfig": {},
  "stepConfig": [],
  "fieldMappings": []
}
```

## Recommended Frontend State Shape

The frontend should keep a builder-shaped state, not a backend-shaped state only.

Example:

```js
const builderState = {
  basics: {
    id: null,
    clientName: "",
    brandCode: "",
    baseUrl: "",
    enabled: true,
    csvFileName: "",
    outputDirectory: "",
    maxRetries: 2,
  },
  schedule: {
    useLegacyCron: false,
    legacyCron: "",
    items: [],
  },
  auth: {
    type: "NONE",
    config: {},
  },
  steps: [],
  response: {
    recordPath: "",
    recordPathType: "JSON_PATH",
    filterByWindow: false,
    recordDatePath: "",
    recordDatePathType: "JSON_PATH",
    recordDateFormat: "",
    duplicateHandling: {
      enabled: false,
      keyHeaders: [],
      defaultAction: "KEEP_FIRST",
      fieldActions: {},
    },
  },
  pagination: {
    enabled: false,
    mode: "PAGE_NUMBER",
    startPage: 1,
    pageParam: "page",
    sizeParam: "",
    pageSize: null,
    totalPagesPath: "",
    totalPagesPathType: "JSON_PATH",
    nextPagePath: "",
    nextPagePathType: "JSON_PATH",
  },
  storage: {
    type: "LOCAL",
    config: {},
  },
  mappings: [],
  advanced: {
    rawJsonOverride: false,
    rawJson: "",
  },
};
```

Why this is better:

- the UI can stay domain-friendly
- weird backend details can be hidden
- serialization becomes predictable

## Section-By-Section UI Requirements

### 1. Basics

Fields:

- `clientName` required
- `brandCode` optional but strongly recommended
- `baseUrl` optional if steps use absolute URLs, recommended otherwise
- `enabled`
- `csvFileName` required
- `outputDirectory` optional for `LOCAL`, still useful for clarity
- `maxRetries` required, integer, minimum `0`

Recommended controls:

- text inputs
- toggle for `enabled`
- number input for retries

Frontend validation:

- `clientName` must not be blank
- `csvFileName` must not be blank
- `maxRetries` must be a non-negative integer

### 2. Schedule

Backend field: `scheduleConfig`

Shape:

```json
[
  { "type": "DAILY", "enabled": true },
  { "type": "MONTHLY", "enabled": true },
  { "type": "HOURLY", "enabled": true, "intervalHours": 1 }
]
```

Recommended UI:

- checkbox cards for `DAILY`, `MONTHLY`, `HOURLY`
- when `HOURLY` is enabled, show `intervalHours`
- optional advanced accordion for legacy `scheduleCron`

Validation:

- at least one enabled schedule for normal scheduled integrations
- `intervalHours >= 1` for hourly

UX note:

- show a short explanation of what each schedule means
- allow multiple enabled schedule types for the same integration

### 3. Auth

Backend field: `authConfig`

Supported types:

- `NONE`
- `BASIC`
- `API_KEY_HEADER`
- `API_KEY_QUERY`
- `BEARER_STATIC`
- `TOKEN_API`
- `OAUTH2_CLIENT_CREDENTIALS`

Recommended UI:

- first select auth type
- render only fields for the selected type

#### Auth Type Matrix

`NONE`

- no extra fields

`BASIC`

- `username`
- `password`

`API_KEY_HEADER`

- `headerName`
- `headerValue`

`API_KEY_QUERY`

- `queryParamName`
- `queryParamValue`

`BEARER_STATIC`

- `headerValue`
- optional `tokenPrefix`, default `Bearer `

`TOKEN_API`

- `method`
- `tokenUrl`
- `headers`
- `bodyTemplate`
- `requestFormat`
- `responseFormat`
- `tokenPath`
- `tokenPathType`
- `tokenHeaderName`
- `tokenPrefix`

`OAUTH2_CLIENT_CREDENTIALS`

- `tokenUrl`
- `clientId`
- `clientSecret`
- optional `scope`
- optional `audience`
- optional `tokenPath`
- optional `tokenPathType`
- optional `tokenHeaderName`
- optional `tokenPrefix`

Validation:

- require only fields relevant to the selected type
- for `TOKEN_API`, require `tokenUrl`, `tokenPath`, and response format/path type
- for OAuth2 client credentials, require `tokenUrl`, `clientId`, `clientSecret`

UI note:

- `headers` should be built with a key-value editor
- `bodyTemplate` should use a textarea or code editor

### 4. Fetch Steps

Backend field: `stepConfig`

This is the most important UI section.

Each step includes:

- `orderIndex`
- `name`
- `enabled`
- `method`
- `url`
- `headers`
- `queryParams`
- `bodyTemplate`
- `requestFormat`
- `responseFormat`
- `requestWindowMode`
- `requestDateVariable`
- `requestDateFormat`
- `paginate`
- `dataStep`
- `responseAlias`
- `responseVariables`
- `responseVariablePathType`

Recommended UI:

- show steps as reorderable cards
- each step card should have:
  - basic request info
  - request data
  - runtime variable extraction
  - advanced options

Step builder controls:

- drag/drop reorder or move up/down
- add step
- duplicate step
- delete step
- enable/disable step

#### Step URL Behavior

`url` can be:

- relative like `/orders`
- absolute like `https://client.example.com/orders`

If relative, backend combines it with `baseUrl`.

#### Step Runtime Variables

`${...}` placeholders work in:

- `url`
- `headers`
- `queryParams`
- `bodyTemplate`

Provide a variable picker in the UI.

Built-in variables to show in help with description of there usage:

- `${clientName}`
- `${brandCode}`
- `${correlationId}`
- `${today}`
- `${now}`
- `${scheduleType}`
- `${fileToken}`
- `${triggerDateTime}`
- `${windowStartDateTime}`
- `${windowEndDateTime}`
- `${windowStartDate}`
- `${windowEndDateExclusive}`
- `${processDate}`
- `${processMonth}`
- `${processHour}`
- `${businessDate}` for daily
- `${previousMonth}` for monthly
- `${requestDate}` and `${requestDateIso}` for single-date fan-out
- `${page}` and custom page/size placeholders during pagination
- `${token}` from token auth
- custom variables from previous steps via `responseVariables`

#### Request Window UI

Supported:

- `NONE`
- `SINGLE_DATE`
- `DATE_RANGE`

Meaning:

- `NONE`: one request only
- `SINGLE_DATE`: backend fans out one request per day in the schedule window
- `DATE_RANGE`: send start/end window placeholders in one request

If `SINGLE_DATE`:

- show `requestDateVariable`
- show optional `requestDateFormat`

#### Data Step vs Non-Data Step

If `dataStep = false`:

- step is used only for setup or variable extraction
- response is not expected to be the final record set

If `dataStep = true`:

- this step contributes data records

Recommended UI:

- label it as:
  - "Setup step"
  - "Data step"

#### Response Variable Extraction

`responseVariables` is a map:

```json
{
  "$.sessionId": "sessionId",
  "$.storeCode": "storeCode"
}
```

Recommended UI:

- key-value table
- left side: path
- right side: variable name
- one select for `responseVariablePathType`

#### Response Alias

`responseAlias` stores the full response body as `${aliasResponse}`.

Recommended UI hint:

- if alias is `session`, created variable is `${sessionResponse}`
- warn users not to enter names already ending with `Response`

### 5. Response Extraction

Backend field: `responseConfig`

Fields:

- `recordPath`
- `recordPathType`
- `filterByWindow`
- `recordDatePath`
- `recordDatePathType`
- `recordDateFormat`
- `duplicateHandling`

Recommended UI:

- "Where are the records?" section
- optional "Filter records to schedule window" section
- optional "Duplicate handling" section

Validation:

- `recordPathType` should match payload type
  - JSON -> `JSON_PATH`
  - XML/SOAP -> `XPATH`
- if `filterByWindow = true`, require:
  - `recordDatePath`
  - `recordDatePathType`
- if custom record dates are not ISO-like, ask for `recordDateFormat`

#### Duplicate Handling UI

Fields:

- `enabled`
- `keyHeaders`
- `defaultAction`
- `fieldActions`

Supported actions:

- `KEEP_FIRST`
- `SUM`

Important backend behavior:

- duplicate keys must use final CSV headers, not raw API paths
- `SUM` only works for numeric values
- blank duplicate keys are treated as unique

Recommended UI:

- multi-select for `keyHeaders`
  - options should come from mapping target headers
- select for `defaultAction`
- row editor for per-header overrides

### 6. Pagination

Backend field: `paginationConfig`

Modes:

- `PAGE_NUMBER`
- `NEXT_URL`

Recommended UI:

- first toggle: pagination enabled
- then select pagination mode

#### PAGE_NUMBER Mode

Fields:

- `startPage`
- `pageParam`
- `sizeParam`
- `pageSize`
- `totalPagesPath`
- `totalPagesPathType`

Validation:

- require `totalPagesPath`
- recommend `pageParam`

#### NEXT_URL Mode

Fields:

- `nextPagePath`
- `nextPagePathType`

Validation:

- require `nextPagePath`

Important behavior:

- pagination only runs for steps where `step.paginate = true`
- pagination config is global, but step participation is per-step

Recommended UI:

- show pagination toggle inside each step
- if a step has `paginate = true`, ensure global pagination is enabled

### 7. Storage

Backend field: `storageConfig`

Supported types:

- `LOCAL`
- `S3`
- `FTP`
- `HTTP_API`

Recommended UI:

- select storage type
- render only fields for the selected type

#### LOCAL

- `localDirectory`

#### S3

- `bucket`
- `region`
- optional `keyPrefix`

Validation:

- bucket required
- region required

#### FTP

- `host`
- `port`
- `username`
- `password`
- `remoteDirectory`
- `passiveMode`

Validation:

- host required
- username required
- password required

#### HTTP_API

- `tenantId`
- `uploadUrl`
- `uploadMethod`
- `uploadFileParam`
- `uploadHeaders`
- `uploadFormFields`
- `uploadSuccessText`

Validation:

- require `uploadUrl` unless `tenantId` is configured in backend application properties
- if using tenant-based config, frontend should still allow `tenantId` even if `uploadUrl` is blank

Recommended UI:

- clear note that `tenantId` depends on backend property configuration
- key-value editors for headers and form fields

### 8. Field Mappings

Backend field: `fieldMappings`

Each row has:

- `sortOrder`
- `mappingType`
- `sourcePath`
- `pathType`
- `targetHeader`
- `expression`
- `defaultValue`
- `formatter`
- `requiredFlag`

Supported mapping types:

- `SOURCE_PATH`
- `CONSTANT`
- `EXPRESSION`

This section should be a table with reorder support.

Recommended columns:

- order
- target header
- mapping type
- source path or expression editor
- default value
- formatter
- required toggle

#### Very Important Serialization Detail

For `mappingType = CONSTANT`, the backend reads the constant value from `expression`.

Frontend recommendation:

- show a UI field called `constantValue`
- when serializing, copy `constantValue` into `expression`
- do not expose the backend naming directly to users

#### Mapping Type Rules

`SOURCE_PATH`

- require `sourcePath`
- require `pathType`

`CONSTANT`

- require constant value
- serialize to `expression`

`EXPRESSION`

- require `expression`

#### Expression Functions

Supported functions inside `fieldMappings[].expression`:

- `value('path')`
- `num('path')`
- `column('HEADER')`
- `columnNum('HEADER')`
- `ctx('key')`
- `ctxNum('key')`

Important rules:

- `${...}` placeholders do not work inside expressions
- `column()` and `columnNum()` depend on `sortOrder`
- if one mapping depends on another header, the depended-on header must come first

Recommended UI:

- expression helper panel with click-to-insert snippets
- runtime variable picker for `ctx()`
- CSV header picker for `column()` and `columnNum()`

#### Formatter UI

Supported formatters:

- `UPPERCASE`
- `LOWERCASE`
- `TRIM`
- `DATE:<outputPattern>`
- `DATE:<inputPattern>-><outputPattern>`
- `DATETIME:<outputPattern>`
- `DATETIME:<inputPattern>-><outputPattern>`

Recommended UI:

- simple select for common formatters
- advanced formatter builder for date and datetime transformations

Validation:

- if formatter is date or datetime based, require output pattern

## Builder Validation Matrix

Frontend should validate before submit.

Minimum rules:

- basics
  - `clientName` required
  - `csvFileName` required
  - `maxRetries >= 0`
- schedule
  - if `HOURLY`, `intervalHours >= 1`
- auth
  - validate per auth type
- steps
  - at least one enabled `dataStep`
  - each step needs `name`, `method`, `url` or top-level `baseUrl`
  - if `SINGLE_DATE`, show `requestDateVariable`
- pagination
  - if enabled and mode is `PAGE_NUMBER`, require `totalPagesPath`
  - if enabled and mode is `NEXT_URL`, require `nextPagePath`
- response extraction
  - if `filterByWindow`, require `recordDatePath`
- duplicate handling
  - if enabled, require at least one `keyHeader`
- mappings
  - require at least one mapping
  - require `targetHeader` on every row
  - require proper field per mapping type

## Serialization Rules

When converting frontend state to backend payload:

1. always send full objects for create and update
2. keep `fieldMappings` sorted by `sortOrder`
3. reindex `sortOrder` sequentially before submit
4. for `CONSTANT` mappings, map `constantValue -> expression`
5. remove empty helper-only UI fields that backend does not know about
6. only include `scheduleCron` if advanced legacy mode is intentionally used
7. send nested sections as normal JSON objects, not stringified JSON

Example serializer target:

```js
const payload = {
  clientName: state.basics.clientName,
  brandCode: state.basics.brandCode,
  baseUrl: state.basics.baseUrl,
  enabled: state.basics.enabled,
  scheduleCron: state.schedule.useLegacyCron ? state.schedule.legacyCron : null,
  scheduleConfig: state.schedule.items,
  csvFileName: state.basics.csvFileName,
  outputDirectory: state.basics.outputDirectory,
  maxRetries: Number(state.basics.maxRetries ?? 0),
  authConfig: serializeAuth(state.auth),
  responseConfig: serializeResponse(state.response),
  paginationConfig: serializePagination(state.pagination),
  storageConfig: serializeStorage(state.storage),
  stepConfig: serializeSteps(state.steps),
  fieldMappings: serializeMappings(state.mappings),
};
```

## Loading Existing Integrations Into The Builder

For edit mode:

1. fetch existing integration
2. normalize nested JSON sections into builder state
3. convert backend-only quirks into UI-friendly fields

Examples:

- `CONSTANT` mapping
  - backend: `expression = "SES1"`
  - frontend state: `constantValue = "SES1"`
- empty missing sections
  - normalize to safe defaults instead of `null`
- `stepConfig`
  - sort by `orderIndex`

## Recommended Component Breakdown

Suggested React structure:

- `pages/IntegrationBuilder.jsx`
- `components/integration-builder/BasicsStep.jsx`
- `components/integration-builder/ScheduleStep.jsx`
- `components/integration-builder/AuthStep.jsx`
- `components/integration-builder/StepsBuilder.jsx`
- `components/integration-builder/ResponseStep.jsx`
- `components/integration-builder/PaginationStep.jsx`
- `components/integration-builder/StorageStep.jsx`
- `components/integration-builder/MappingsStep.jsx`
- `components/integration-builder/PayloadPreview.jsx`
- `components/integration-builder/TemplatePicker.jsx`

Shared low-level controls:

- `KeyValueEditor`
- `ScheduleSelector`
- `PathTypeToggle`
- `PayloadFormatSelect`
- `MappingRowEditor`
- `StepCard`
- `ExpressionHelper`

## Recommended User Flow

Best end-to-end flow:

1. click `New Integration`
2. choose a template
3. fill Basics
4. select schedules
5. configure auth
6. configure one or more steps
7. configure response extraction
8. configure storage
9. build mappings
10. review payload preview
11. save integration
12. offer quick actions:
    - run now
    - run by schedule type
    - custom backfill run

## MVP vs Phase 2

### MVP

Build these first:

- Basics
- Schedule
- Auth
- one-step fetch builder
- response extraction
- storage
- field mappings
- payload preview
- create and update integration

### Phase 2

Add after MVP:

- multi-step chaining UI
- duplicate handling builder
- expression helper UI
- clone integration
- import raw JSON
- export payload
- test path helper for JSONPath/XPath
- template library

## Specific Notes For Current Frontend

Current `frontend/src/pages/Integrations.jsx` creates only a minimal integration with:

- `clientName`
- `brandCode`
- `baseUrl`
- `csvFileName`
- `maxRetries`

That is not enough for real integrations.

Recommended change:

- keep `Integrations.jsx` as listing and quick actions page
- move create/edit into a dedicated builder route
  - `/integrations/new`
  - `/integrations/:id/edit`

## Example Payloads To Use As Frontend Templates

Frontend should ship starter templates based on these backend-supported patterns:

- simple range JSON API
- single-date monthly fan-out
- full dump plus local window filtering
- session plus pagination multi-step flow
- XML/SOAP mapping flow

These examples already exist in:

- `API-Integration/HOW-TO-USE.md`
- `API-Integration/CONFIGURATION-VARIABLE-REFERENCE.md`

## Final Recommendation

Do not build this as one huge raw form.

Build it as:

- template picker
- wizard-style builder
- payload preview
- advanced override mode

That combination will cover both normal users and expert users, and it maps well to how the backend actually executes integrations.
