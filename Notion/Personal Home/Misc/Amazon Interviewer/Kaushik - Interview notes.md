---

---

9.36: Given question : Path to file with ENV vars

9.40: Asks many clarification questions

9.43: starts coding

9.46: Not familiar with Python syntax

9.48: Has clear code with proper variable names

9.51: Completed code

9.52: Given recursive case

9.53: Uses a new function for recursive case

10.00: Struggles to fit recursion into existing code

10.02: Made assumptions in ENV values not having multiple $ signs

10.06: Solved

10.11: Behavioral question - challenging problem - requirements changed - reduced scope - 

### Code

```javascript
# input
#1> Path with env variables
#2> key value pairs env variables

#output 
# resolved path, path with env variables resolved

#sample input
dir1/dir2/dir3/str_$env1/dir1/file.txt #func1: splitiing the dirs... #func2: resolve_env_

{"env0": 'dirxyz'}
{"env1": "env0"}
{"env2": "dir5-$env1/$env3/file.txt"}
{"$env3": "dir_abc"}

#sample output
dir1/dir2/dir3/dir4/dir1/file.txt


def resolve_env_variable(env_value, env_variables_map):
    if '$' not in env_value:
        pass:
    else:
        #find and replace $env
        env_variable_start_index = dir_.indexOf('$')
        env_name = dir_[env_variable_start_index+1:]
        env_value[env_variable_start_index:] = env_variables_map[env_name]

        #resolve further
        env_value = resolve_env_variable(env_value, env_variables_map):
    return env_value
    
    

















def resolve_path(input_path, env_variables_map):
    resolved_path = list()
    for dir_ in input_path.split('/'): #individual directories
        if '$' not in dir_:
            resolved_path.appened(dir_)
        else:
            #finding and resolving first $env
            env_variable_start_index = dir_.indexOf('$')
            env_name = dir_[env_variable_start_index+1:]
            dir_[env_variable_start_index:] = env_variables_map[env_name]
            
            if '$' in dir_: #still unresolved
                dir_ = resolve_path(dir_, env_variables_map)
            resolved_path.appened(dir_)

    return resolved_path.join('/')
```