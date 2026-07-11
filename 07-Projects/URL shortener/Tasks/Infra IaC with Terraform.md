---
base: "[[07-Projects/URL shortener/Tasks/Tasks]]"
Assign: []
Property: ""
Status: Partial
---
## Terraform

[https://learn.hashicorp.com/collections/terraform/aws-get-started](https://learn.hashicorp.com/collections/terraform/aws-get-started)

> [!note]+ Lambda
> - [x] Create IAM role
> - [x] Attach a policy
>     - [x] Lambda execution
>     - [x] DynamoDB connection
> - [x] Create function or update function
> - [x] ENV variables

> [!note]+ DynamoDB
> - [x] Create table
>     - [x] terraform import aws_dynamodb_table.shortener-ddb URIStore

> [!note]+ API endpoint
> - [x] Create API endpoint
> - [x] Create resource at root path with path name
> - [x] Register HTTP method
> - [x] Integrate API endpoint with lambda
> - [x] Add lambda invocation permission to API endpoint
> - [x] Deploy
> - [ ] Set throttle values
> - [ ] Create x-api-key

> [!note]+ WAF (maybe later)
> > [!note]+ Create ACL with free rules
> 

> [!note]+ Amplify?


> [!note]+ Billing Alarm
