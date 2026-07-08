---
notion-id: 20e02d25-148c-8041-b39e-f8e57d5ae304
---

10.01: Introduction

10.04: Question 1: Given a string containing close and open parentheses, return the minimum number of additions (open/close parentheses) required to make the string balanced. 
Eg. “())” → should return 1
       “(((” → should return 3

10.05: TC asked good clarification questions - other braces, characters

10.08: TC wants to use stack

10.12: Solution sounds like a lot of if condition

10.15: Starts with implementation

10:20: Finished impl and started dryruns

10.24: Asked TC for constant space approach

10.25: TC gave an approach with a boolean and counter

10.27: Question 2 : Given a matrix consisting of 0s and 1s, where 1 represents building and 0 represents trees, and 1s 4-directionally adjacent belong to the same building, find the area of the largest building - was honest about encountering a similar question in the previous round

10.28: Changed to a different question - Given a list of services and dependency pairs, give the order in which services should be built given a dependency list

10.30: TC asked good clarification questions with cycles in the graph

10.32: TC struggled with the approach

10.35: Asked approach to detect cycle

10.38: TC gave a high-level approach to detect cycles in the graph

10.40: But stuck trying to figure out how to find the path with the cycle detection logic

10.41: TC knows what topological sort is, has read it, but unable to recall how to implement

10.43: Asked to implement cycle detection logic

10.47: Implemented with a few bugs

10.49: Missed how visited is not resetting across checks

10.50: Assumed an undirected graph and got confused

10.55: Stuck and unable to finish


```python
# "((("  3
# "())"  1

# ")))"  3
# ")()"  1



add/close paranethesis
moves = 

input = "()"

T : O(n)
S : O(n)

def count_moves(input_string: str) -> int:
    
    stack = []
    # bool : haveSeenOpeningBrace = false
    number_of_moves = 0
    
    for i in range(len(input_string)):
        if input_string[i] == '(':
            stack.append('(')
            # number_of_moves += 1
            # haveSeenOpeningBrace = true
        if input_string[i] == ')':
            if len(stack) > 0 and stack[-1] == '(': # # haveSeenOpeningBrace = true
                stack.pop()
                # number_of_moves -= 1
            else:
                # number_of_moves += 1
                stack.append(')')
            
    number_of_moves = len(stack)     
    
    return number_of_moves
    
stack = [ ) ) ) ]
input = ")))"  # Output : 3
number_of_moves = 3




m * n matrix of 0s and 1s
1 buildings 0 are roads
building connecteds


grid = [[1, 1, 0 , 1],
        [1, 1, 0,  0]]
        
        
number of packages/repos/services = n
dependency between service

service a depends on service b

return order of building services

[[0, 1], [0, 2], [1, 3]]

1 -> 0 
2 -> 0 
3 -> 1

3 -> 1 / 2 -> 0


if cycles return -1

dependecy_list = ()
visted = ()


# build a dependcy list -- loop through the input
#   visited set = ()
# result string = [3, 1, 0]
# result string 2 = [2, 0]
# run dfs for each node in (0, n)
#   add current node to visited
#   add currenot node to result
#   dfs(neights)
#   check for cycles:
#       if already in visited: return -1
# return result 


def detect_cycle(adjacency_list: list[list[int]], n: int) -> bool:
    
    visited = set()
    
    def dfs(node):
        visited.add(node)
        for nei in adjacency_list[node]:
            if nei not in visited:
                dfs(nei)
            else:
                return false
        return true
    
    result = true
   
    [[0, 1], [0, 2], [1, 3]]
    
    # 0 : None
    # 1:  0
    # 2:  0
    # 3 : 1
    
    
    # 1 -> 2 -> 3 -> 0
    
    for i in range(n):
        result = result and dfs(i)
    
    return result
```

