import os
import re

dir_path = r'C:\Users\aiyap\lifekart\mobile\lib\shared\models'

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

for filename in os.listdir(dir_path):
    if not filename.endswith('.dart'): continue
    
    filepath = os.path.join(dir_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        original_content = f.read()

    content = original_content

    # 1. Update fromJson keys
    def repl_from_json(match):
        key = match.group(1)
        snake = camel_to_snake(key)
        if snake != key:
            return f"(json['{snake}'] ?? json['{key}'])"
        else:
            return f"json['{key}']"

    content = re.sub(r"json\['([a-zA-Z0-9_]+)'\]", repl_from_json, content)

    # 2. Update toJson keys
    # We will search for all instances of 'camelCaseKey': and convert the key to snake case,
    # ONLY if they appear inside a toJson method.
    
    to_json_idx = content.find('toJson')
    if to_json_idx != -1:
        before = content[:to_json_idx]
        after = content[to_json_idx:]
        
        def repl_to_json_keys(match):
            key = match.group(1)
            snake = camel_to_snake(key)
            return f"'{snake}':"
            
        after = re.sub(r"'([a-zA-Z0-9_]+)':", repl_to_json_keys, after)
        content = before + after

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filename}')
print('All Done')
