---
notion-id: 20e02d25-148c-8082-bfc0-fe7a5330910d
---
- [ ] [https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/description/](https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/description/)


9.00: Asked the candidate to give an introduction - TC seems to read from the screen line-by-line

9.05: Question 1: Given a string containing close and open parentheses, return the minimum number of additions (open/close parentheses) required to make the string balanced. 
Eg. “())” → should return 1
       “(((” → should return 3

9.10: TC gave the approach for open and close counter with correct time and space complexity

9.13: TC ginished implementation

9.14: Probed to check for corner cases

9.17: TC gave zero string and valid string use cases

9.19: Question 2 : Given a matrix consisting of 0s and 1s, where 1 represents building and 0 represents trees, and 1s 4-directionally adjacent belong to the same building, find the area of the largest building.

9.20: Asked a few questions about bfs vs dfs - was able to answer correctly.

9.22: TC started implementation

9.25: TC assumed a square matrix instead of m x n

9.30: Modified the solution editing from top to bottom (like how Cline edits in VS Code)

9.32: Asked to modify the solution to accommodate the case where matrix wraps around

9.36: Felt like the candidate read somewhere for the answer. mentioned queue. then quickly jumped to dfs logic with wrap around logic

9.38: Asked a few questions to clarify the thinking - the answers felt AI generated

9.40: Gave one more modification - every building on last column is connected to every building on the first column

9.42: TC talked about the approach and mentioned that extra space is needed

9.48: Unable to answer why extra space was needed; cannot explain the reasoning.

```javascript
function foo(items) {
  var i;
  for (i = 0; i < items.length; i++) {
    alert("Welcome To LiveCode " + items[i]);
  }
}

# "())" -> (()) 
# "((("

def minAddToMakeValid(s:str)-> int:
    open_needed=0
    close_needed=0
    
    for char in s:
        if char=='(':
            open_needed+=1
        elif char==')':
            if open_needed >0:
                open_needed-=1
            else:
                close_needed+=1
                
    return open_needed+close_needed
    

    input: ")()("
   ---------------------
   
   # m x n
   
def dfs_cylindrical(matrix, visited,x,y,m,n):
    if x<0 or y<0  or x >=m or y>=n or matrix[x][y]==0:
        return 0
        
    if y<0:
        y=n-1
    elif y>=n:
        y=0
        
    if visited[x][y]:s
        return 0
        
    visited[x][y]=True
    area=1
    
    area+=dfs(matrix, visited, x+1, y,m,n)
    area+=dfs(matrix, visited, x-1, y,m,n)
    area+=dfs(matrix, visited, x, y+1,m,n)
    area+=dfs(matrix, visited, x, y-1,m,n)
    
    return area
    
def largestBuildingDFS(matrix):
    if not matrix or not matrix[0]:
        return 0
    
    m=len(matrix)
    n=len(matrix[0])
    visited=[[False] * n for _ in range(m)]
    max_area=0
    
    for i in range(m):
        for j in range(n):
            if matrix[i][j]==1 and not visited[i][j]:
                current_area=dfs_cylindrical(matrix, visited, i, j,m, n)
                max_area=max(max_area, current_area)
                
    return max_area
    
    time: O(m*n)
    space: O(m*n)
    
    

1 0 0 
0 0 0
0 0 1

















```
