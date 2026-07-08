---
notion-id: 68660c08-a4d6-4537-927d-49a584cb67d2
---

10:32: Given path to file containing 

10:34: Explaining the answer

10:38: Does not ask clarifying questions

10.39: Starts with the implementation

10.41: Struggles to get started on how to parse the string

10.42: Stuck with using regular expression

10.43: Converts dict to list and then linearly searches for key instead of doing a constant lookup directly on the map. Told to directly use dict, but did not understand what I meant.

10.49: Doesn’t have good idea of local vs reference variable

10.52: Not familiar with python syntax

10.54: Code not readable, does not have understandable variable names

10.55: Given recursive case

10.56: Did not still give the idea of recursion

10.59: Tries to resolve all ENV variables first, but stuck with string manipulation.

11.10: Told to assume regex function, so he wrote pseudocode

11.13: Challenging problem question - xml configuration messed up for creating letters

```javascript
// C://dir1/%ENV1%/foo/bar.txt
// (dir1, %ENV1%-something%ENV2%, foo, 'bar.txt')
// { "ENV1" : ("dir2"), ... }
// { "ENV2" : ("dir3-%ENV1%", "dir4") }
// { "ENV2" : ("dir3-dir2", "dir4") }

// dir3-dir2/dir4
// C://dir1/dir2/foo/bar.txt
import re

def translatePath(self,path,dicto )
    values=dicto.values()
    keys=dicto.keys()
    for x in values:
        for y in x:
            toreplace=re.find(//ellement delimited by %)
            //replacing elements  with percentages sign to their actual values 
            y.replace(toreplce, dicto(toreplace))
            # finalvalue=""
            # for z in y:
    size=len(path)
    for x in range(0,size):
        tempvalue=path[x]
        temp.remove("%")
        if  tempvalue in keys:
            path[x]=dicto(tempvalue)
    return path
```