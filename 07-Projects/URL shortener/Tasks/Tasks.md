# Tasks

> Consolidated from 28 Notion database rows (was `Tasks.base`). 15 data-only rows + 12 with short notes folded into this table; 1 long entries kept as linked notes.

| Name | Assign | Property | Status | Notes |
| --- | --- | --- | --- | --- |
| CI-CD Setup Github Actions for build and test | [] |  | Completed |  |
| Core 301 for valid GET requests | [] |  | Not started |  |
| Core Align code and Swagger docs | [] |  | Completed | Swagger does not allow GET and POST request for the same path name. Need to change the architecture. - [x] Change API endpoint - [x] Change TinyID to shortID - [x] Allow only GET & POST at endpoint level |
| Core Custom alias for ShortID | [] |  | Completed |  |
| Core Implement GET request | [] |  | Completed | GET request to get the full URL for the tinyID |
| Core Implement PUT request | [] |  | Completed | PUT request to store the full URL for the tinyID. If a custom tinyID is not provided, generate at server side. |
| Core Optimize multiple DB request for PUT operation | [] |  | Not started | PUT request queries DB to check if custom key / generated key is already present and then inserts. Instead, DB putItem() can be triggered and fail if key is already present. This essentially combines a getItem() and putItem() to a single putItem(). Also multiple putItem() can be triggered concurrently using go routines and wait only for the first successful response. Need to watch out for heavy load on DynamoDB and no. of concurrent requests per second. |
| Core Use base62 encoding | [] |  | Completed | Current tinyID generation creates base64 encoded string. But this contains - and _ strings which are not very neat when URL encoded. |
| Core Use ENV variable for table name | [] |  | Completed | For ease of configuration without having to deploy lambda every time. [https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html) |
| Core Use log level from lambda ENV | [] |  | Not started |  |
| CoreUX 404 page for invalid GET requests | [] |  | Not started |  |
| CoreUX URL hits | [] |  | Not started |  |
| Docs Import Swagger documentation directly to AWS console | [] |  | Deferred |  |
| Docs Swagger API basic docs | [] |  | Completed |  |
| Docs Swagger GitHub integration | [] |  | In progress | Sync swagger docs directly to GitHub |
| Infra Automate x-api-key creation | [] |  | Not started |  |
| Infra AWS WAF bot control | [] |  | Completed | Rate limiting based on origin IP [https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html) Was able to setup a minimal WAF for shortener api gateway by just following the wizard. 1. Seems like some part of WAF is charged (not available in free tier). Found from AWS Billing. Alerted by Cloudwatch billing alarm to my email (Promotions tab) rising to 0.35$. >> Turns out WAF bot control is paid rule. Missed to notice that. 2. ACL rule gives 403 Forbidden for requests from Swagger. Temporarily disassociated the API endpoint with ACL |
| Infra Buy a custom domain | [] |  | Not started |  |
| Infra IaC with Terraform | [] |  | Partial | [[Infra IaC with Terraform]] |
| Infra Identify scaling bottleneck | [] |  | Not started | DynamoDB provisioned capacity with just 5 reads and writes throughput |
| Infra Terraform APIG CORS | [] |  | Not started |  |
| Infra Test Lambda locally | [] |  | Not started | Mock dynamodb locally |
| InfraCore TTL for DDB items | [] |  | Not started |  |
| Untitled | [] |  |  |  |
| Untitled 1 | [] |  |  |  |
| UX Beautify front-end | [] |  | Completed | - [x] Proper CSS - [x] "Loading" placeholder for shortener request - [x] Custom shortID for shorten request - [x] Handling invalid input URLs - DEFERRED - [x] Show embed preview of URL to shorten - DEFERRED - [x] Output URL in text box with copy button - [x] Clear button in URL input - DEFERRED - [x] Handle failure cases better - DEFERRED |
| UX favicon.ico | [] |  | Not started |  |
| UX Host minimal front-end | [] |  | Completed | Following tutorial [https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/](https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/) Site is up! [https://main.d1uwmqm5yhree5.amplifyapp.com/](https://main.d1uwmqm5yhree5.amplifyapp.com/) Using Amplify, when deployment is done, changes do not reflect instantly. Integrated front-end with REST API using jQuery and AJAX. Enabling CORS is important. |
