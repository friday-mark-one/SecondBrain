---

---

11.35: Given Path to file with ENV variables, return resolved path

11.40: Understood the question, but did not ask much clarifying questions.

11.45: Finishes code with ENV resolving-first approach, and then change path

11.46: Mentions deep copy vs shallow copy while returning returning string

11.48: Gives time complexity as O(N). Missed to consider string replace complexity. Pointed that out. Changed with little bit struggle to O(NM).

11.51: Told to take different approach because ENV size can be huge

11.54: Comes up with approach to do string manipulation and key lookup

11.58: Still does iteration on map; did not fully understand 

12.00: Completes implementation with manual implementation for find and replace with flags and index

12.10: Given recursion input case

12.14: Completes code with hardcoded 1 level nesting

12.15: Pointed about multiple level nesting

12.16: Quickly grasped and corrected them

12.17: Out of comfort zone experience - research, papers

```javascript
// C://Users/%USERNAME%/Downloads/%FOO%-asdfas/%ABC%/file.txt
// a = { "USERNAME" : "wenting", "FOO" : "BAR-%USERNAME%", "ABC" : "%FOO%", .... } 
// C://Users/wenting/Downloads/BAR/file.txt

// map size - N
// len(str) - M
// O(N)
// replace function - worest O(M)
// in total worest time complexity = O(N*M)



public String updateString(String path, Map<String, String> replacePairs) {
    private Map<String, Integer> startIdx = new HashMap<>();
    
    if (replacePairs == null) {
        return path;
    }
    
    boolean flag = false;
    int idx = -1;
    String key = "";
    String newPath = path.clone();
    
    for (int i = 0; i < path.length(); i++) {
        
        if(path.charAt(i) == "%" && !flag) {
            flag = true;
            idx = i;
            continue;
        }
        
        if (flag && path.charAt(i) != "%") {
            key += path.charAt(i);
            continue;
        }
        
        if (flag && path.charAt(i) == "%") {
            flag = false;
            String replace = replacePairs.get(key);
            replace = updateString(replace, replacePairs);
            newPath[idx:i] = replace;
            
            key = "";
            continue;
        }
    }
    
    return newPath;
}
```

in [UHire](https://upats.my.salesforce.com/?startURL=%2Fapex%2FInterview)
 with
