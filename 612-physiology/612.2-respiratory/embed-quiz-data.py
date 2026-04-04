#!/usr/bin/env python3
"""
Embed quiz JSON data directly into HTML file to avoid CORS issues
"""
import json

# Read quiz data
with open('612.2-fri-night-quiz-4.3.26.json', 'r', encoding='utf-8') as f:
    quiz_data = json.load(f)

# Read HTML template
with open('friday-night-quiz-4.3.26.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Convert quiz data to compact JavaScript
js_data = json.dumps(quiz_data, ensure_ascii=False, separators=(',', ':'))

# Find and replace the embedded data section
marker_start = 'const quizData = {'
marker_end = 'let userAnswers'

start_idx = html.find(marker_start)
end_idx = html.find(marker_end, start_idx)

if start_idx == -1 or end_idx == -1:
    print("Error: Could not find markers in HTML file")
    exit(1)

# Replace the section
new_html = (
    html[:start_idx] +
    f'const quizData = {js_data};\n\n' +
    html[end_idx:]
)

# Write updated HTML
with open('friday-night-quiz-4.3.26.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f"✓ Successfully embedded {len(quiz_data['question_bank'])} questions into HTML")
print(f"  File size: {len(new_html):,} bytes")
