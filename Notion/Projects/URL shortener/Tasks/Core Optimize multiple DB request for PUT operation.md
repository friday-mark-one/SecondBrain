---
notion-id: 490ba5e8-f5a6-4512-ac09-8bf59c9e8ea0
base: "[[Tasks.base]]"
Assign: []
Property: ""
Status: Not started
---
PUT request queries DB to check if custom key / generated key is already present and then inserts. Instead, DB putItem() can be triggered and fail if key is already present. This essentially combines a getItem() and putItem() to a single putItem().

Also multiple putItem() can be triggered concurrently using go routines and wait only for the first successful response. 

Need to watch out for heavy load on DynamoDB and no. of concurrent requests per second.
