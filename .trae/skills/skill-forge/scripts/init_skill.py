#!/usr/bin/env python3
"""
Skill Initializer - Creates a new skill directory with best-practice template.

Usage:
    init_skill.py <skill-name> --path <path>

Example:
    init_skill.py my-skill --path ./skills
    init_skill.py code-reviewer --path /custom/location
"""

import sys
from pathlib import Path

SKILL_TEMPLATE = '''---
name: {skill_name}
description: "[TODO: Write description using keyword bombing technique. Include: 1) Core capability (first sentence), 2) Action verbs (what users ask to do), 3) Object nouns (what users mention), 4) Natural phrases (what users would literally type). See references/description-guide.md]"
---

# {skill_title}

IRON LAW: [TODO: Write one unbreakable rule that prevents the most likely mistake]

## What is This Skill

[TODO: Brief description of what this skill does and why it exists]

## Workflow

Copy this checklist and check off items as you complete them:

```
[TODO: Skill name] Progress:

- [ ] Step 1: [First step] ⚠️ REQUIRED
  - [ ] 1.1 [Sub-step]
  - [ ] 1.2 [Sub-step]
- [ ] Step 2: [Second step]
- [ ] Step 3: [Third step] ⚠️ REQUIRED
- [ ] Step 4: Output
```

## Step 1: [First Step]

[TODO: Detailed instructions for step 1]

## Step 2: [Second Step]

[TODO: Detailed instructions for step 2]

## Step 3: [Third Step] ⚠️ REQUIRED

[TODO: Detailed instructions for step 3]

## Step 4: Output

[TODO: Output format and pre-delivery checklist]

## Anti-Patterns

[TODO: List what NOT to do]

## Resources

### references/

| File | Purpose |
|------|---------|
| [TODO: List reference files] |

### scripts/

| Script | Purpose |
|--------|---------|
| [TODO: List scripts] |
'''

def title_case_skill_name(skill_name):
    """
    Convert hyphenated skill name to Title Case for display.
    """
    return ' '.join(word.capitalize() for word in skill_name.split('-'))

def init_skill(skill_name, path):
    """
    Initialize a new skill directory with best-practice template.

    Args:
        skill_name: Name of the skill
        path: Path where the skill directory should be created

    Returns:
        Path to created skill directory, or None if error
    """
    skill_dir = Path(path).resolve() / skill_name

    if skill_dir.exists():
        print(f"Error: Skill directory already exists: {skill_dir}")
        return None

    try:
        skill_dir.mkdir(parents=True, exist_ok=False)
        print(f"Created skill directory: {skill_dir}")
    except Exception as e:
        print(f"Error creating directory: {e}")
        return None

    # Create SKILL.md from template
    skill_title = title_case_skill_name(skill_name)
    skill_content = SKILL_TEMPLATE.format(
        skill_name=skill_name,
        skill_title=skill_title
    ).lstrip()

    skill_md_path = skill_dir / 'SKILL.md'
    try:
        skill_md_path.write_text(skill_content)
        print("Created SKILL.md")
    except Exception as e:
        print(f"Error creating SKILL.md: {e}")
        return None

    # Create resource directories (empty — user fills as needed)
    for dirname in ('scripts', 'references', 'assets'):
        (skill_dir / dirname).mkdir(exist_ok=True)
        print(f"Created {dirname}/")

    print(f"\nSkill '{skill_name}' initialized at {skill_dir}")
    print("\nNext steps:")
    print("1. Fill in all [TODO] items in SKILL.md")
    print("2. Write your description using the keyword bombing technique")
    print("3. Add scripts/, references/, assets/ as needed")
    print("4. Delete any empty resource directories you don't need")
    print("5. Run package_skill.py when ready")

    return skill_dir

def main():
    if len(sys.argv) < 4 or sys.argv[2] != '--path':
        print("Usage: init_skill.py <skill-name> --path <path>")
        print()
        print("Skill name requirements:")
        print("  - Hyphen-case (e.g., 'data-analyzer')")
        print("  - Lowercase letters, digits, and hyphens only")
        print("  - Max 64 characters")
        print()
        print("Examples:")
        print("  init_skill.py my-skill --path ./skills")
        print("  init_skill.py code-reviewer --path /custom/location")
        sys.exit(1)

    skill_name = sys.argv[1]
    path = sys.argv[3]

    print(f"Initializing skill: {skill_name}")
    print(f"Location: {path}")
    print()

    result = init_skill(skill_name, path)
    sys.exit(0 if result else 1)


if __name__ == "__main__":
    main()
