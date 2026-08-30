const integrationPromptTemplate = `Create one import-ready Integration Builder JSON for my frontend.

Output rules:
- Return exactly one JSON object
- Output JSON only
- No markdown
- No comments
- No explanation
- Keep the JSON valid for direct import into my frontend builder

Goal:
- Fill only the logic-heavy parts from the curl + field mapping rules
- Leave non-inferable business/setup fields blank or default
- Do not guess business values

Use this exact shape:

{
  "clientName": "",
  "brandCode": "",
  "baseUrl": "",
  "enabled": false,
  "schedulerMode": "QUEUE",
  "scheduleCron": null,
  "scheduleConfig": [],
  "csvFileName": "",
  "outputDirectory": "",
  "maxRetries": 2,
  "authConfig": {
    "type": "NONE",
    "config": {}
  },
  "responseConfig": {
    "recordPath": "",
    "recordPathType": "JSON_PATH",
    "filterByWindow": false,
    "recordDatePath": "",
    "recordDatePathType": "JSON_PATH",
    "recordDateFormat": "",
    "duplicateHandling": {
      "enabled": false,
      "keyHeaders": [],
      "defaultAction": "KEEP_FIRST",
      "fieldActions": {}
    }
  },
  "paginationConfig": {
    "enabled": false,
    "mode": "PAGE_NUMBER",
    "startPage": 1,
    "pageParam": "page",
    "sizeParam": "",
    "pageSize": null,
    "totalPagesPath": "",
    "totalPagesPathType": "JSON_PATH",
    "nextPagePath": "",
    "nextPagePathType": "JSON_PATH"
  },
  "storageConfig": {
    "type": "LOCAL",
    "config": {
      "localDirectory": ""
    }
  },
  "stepConfig": [],
  "fieldMappings": []
}

Fill from input when inferable:
- baseUrl
- authConfig
- responseConfig
- paginationConfig
- stepConfig
- fieldMappings

Keep blank/default unless explicitly provided:
- clientName
- brandCode
- csvFileName
- outputDirectory
- scheduleConfig
- scheduleCron
- storageConfig
- maxRetries
- enabled

Rules:

1. Auth
- Bearer token header -> authConfig.type = "BEARER_STATIC" with:
  config.tokenPrefix = "Bearer "
  config.headerValue = "<token>"
- API key header -> API_KEY_HEADER
- API key query param -> API_KEY_QUERY
- Basic auth -> BASIC
- If auth is unclear, keep NONE and preserve headers in the request step

2. StepConfig
Create one main data step unless I explicitly describe multi-step flow.
Each step must include:
- orderIndex
- name
- enabled
- method
- url
- headers
- queryParams
- bodyTemplate
- requestFormat
- responseFormat
- requestWindowMode
- requestDateVariable
- requestDateFormat
- paginate
- dataStep
- responseAlias
- responseVariables
- responseVariablePathType

Defaults:
- enabled = true
- dataStep = true
- paginate = false
- requestWindowMode = "NONE"
- responseAlias = ""
- responseVariables = {}
- responseVariablePathType = "JSON_PATH"

3. URL handling
- Extract baseUrl
- Keep step url relative if possible
- Move query params from curl URL into queryParams

4. Request/response format
- JSON -> JSON_PATH
- XML/SOAP -> XPATH
- If unclear, prefer JSON only if curl strongly suggests JSON

5. Pagination
- Only enable if clearly visible from curl or hints
- Page number pagination -> PAGE_NUMBER
- Cursor/next URL -> NEXT_URL
- If unknown, leave disabled

6. Response config
- Fill recordPath only if inferable or explicitly provided
- If unknown, leave blank
- Fill recordDatePath, recordDateFormat, and filterByWindow only if explicitly indicated

7. Field mappings
- Direct source -> SOURCE_PATH
- Fixed constant -> CONSTANT and store value in expression
- Computed/conditional -> EXPRESSION
- Sequential sortOrder from 1
- requiredFlag = true only if explicitly required
- Use defaultValue only if explicitly needed
- Use formatter only if explicitly needed

8. Expressions
Allowed helpers:
- value('path')
- num('path')
- column('HEADER')
- columnNum('HEADER')
- ctx('key')
- ctxNum('key')

Conditional example:
- value('$.status') == 'PAID' ? 'SUCCESS' : 'PENDING'

If an expression depends on another mapped header, keep correct sortOrder.

9. Do not invent
- client name
- brand code
- record path
- pagination paths
- storage values
- schedule logic
- token API flow
- multi-step session flow
unless I explicitly provide them.

Now generate the JSON from this input:

CURL:
[paste curl here]

FIELD_MAPPINGS_REQUIRED:
- targetHeader:
  source_or_rule:
  required:
  formatter:
  defaultValue:
  notes:

OPTIONAL_HINTS:
- clientName:
- brandCode:
- csvFileName:
- outputDirectory:
- responseFormat:
- recordPath:
- recordDatePath:
- recordDateFormat:
- pagination:
- duplicateHandling:
- single-date or date-range:
- multi-step auth/session:
`;

export default integrationPromptTemplate;
