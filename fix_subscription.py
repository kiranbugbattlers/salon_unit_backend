import re

# Read the corrupted file
with open('src/subscription/subscription.service.ts', 'r') as f:
    content = f.read()

# Fix the corrupted relations lines
content = re.sub(r'relations: \\\\n      \\\[\" onboarding\\\\, \\\\documents\"\\\]', 
                "relations: ['onboarding', 'documents']", content)

# Remove any literal \n characters and replace with actual newlines
content = content.replace('\\n', '\n')

# Write back the fixed content
with open('src/subscription/subscription.service.ts', 'w') as f:
    f.write(content)

print("Fixed subscription service file")
