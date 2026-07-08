---
notion-id: 20e02d25-148c-801a-981f-f69e40d9cdd6
---

12.03: Started late by 3 minutes

12.04: Intro

12.09: Question 1: Given a string containing close and open parentheses, return the minimum number of additions (open/close parentheses) required to make the string balanced. 
Eg. “())” → should return 1
       “(((” → should return 3

12.10: TC wants time to think (uses white paper)

12.14: TC gives a brute force approach - just 2 counters to keep track of open & close parentheses and return the difference

12.17: Asked to think of corner cases - TC figured out that it won’t work for the case “)(”

12.20: TC came up with counter solution with open > close constraint, but struggling to handle extra close parentheses case

12.24: TC wants to use stack to keep track of balanced parenthesis use case

12.27: Almost gave the answer to TC. Still struggling

12.38: TC gave the right approach for this question 2 min into the 2nd question



12.34: Given a list of services and dependency pairs, return true if the service is buildable, false otherwise

12.40: TC doesn’t have strong foundation with graph algorithm

12.47: Gave more clarification that this is cycle detection algorithm

12.49: TC asked if the graph can have disconnected components

12.51: TC gave a very vague logic to detect cycles. Unable to materialize the actual flow of logic.

12.55: TC gave a brute force approach to perform dfs on every node and check for visited

12.57: TC improved on the brute force logic to ignore already visited good paths

12.58: Asked for time complexity - struggling to arrive at the complexity - initially gave - O(V*E)

12.59: Corrected to O(V+E) after a few minutes


```javascript
"())"
"((("
")("

"))(()("


[[0,1], 
[1,2], 
[3,1]]

3/2 -> 1 -> 0

3 -> 1 -> 0
2->

[1,0],[0,1]

dfs(vertex)
looping through the connected vertices.
[3, 1, 0]
dfs(3) -> dfs(1) -> dfs(0) 
```