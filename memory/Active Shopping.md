```TASK 
FROM "Shopping-List.md"
WHERE !completed
GROUP BY store
```

```TASK 
FROM "Shopping-List.md"
WHERE !completed AND type = "Staples"
GROUP BY store
```

```TASK 
FROM "Shopping-List.md"
WHERE !completed AND store = "Costco"
```
