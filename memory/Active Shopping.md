```dataview
TASK 
WHERE file.name = "Shopping Tracker"
WHERE !completed
GROUP BY store
```

```dataview
TASK 
WHERE file.name = "Shopping Tracker"
AND !completed AND type = "Staples"
GROUP BY store
```

```dataview
TASK 
WHERE file.name = "Shopping Tracker"
AND !completed AND store = "Costco"
```
