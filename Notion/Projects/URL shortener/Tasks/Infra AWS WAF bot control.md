---
base: "[[Tasks.base]]"
Assign: []
Property: ""
Status: Completed
---
Rate limiting based on origin IP

[https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html)

Was able to setup a minimal WAF for shortener api gateway by just following the wizard.

1. Seems like some part of WAF is charged (not available in free tier). 
Found from AWS Billing. Alerted by Cloudwatch billing alarm to my email (Promotions tab) rising to 0.35$.
>> Turns out WAF bot control is paid rule. Missed to notice that.
2. ACL rule gives 403 Forbidden for requests from Swagger.
Temporarily disassociated the API endpoint with ACL