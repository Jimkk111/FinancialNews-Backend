#!/usr/bin/env python3
"""
Skill Validator - Quick validation of skill structure and frontmatter.

Usage:
    quick_validate.py <path/to/skill-folder>

Example:
    quick_validate.py ./my-skill
"""

import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)


def validate_skill(skill_path):
    """
    Validate a skill folder structure and frontmatter.

    Args:
        skill_path: Path to the skill folder

    Returns:
        Tuple of (valid: bool, message: str)
    """
    skill_path = Path(skill_path).resolve()

    if not skill_path.exists():
        print(f"Error: Skill folder not found: {skill_path}")
        return None, False

    if not skill_path.is_dir():
        print(f"Error: Path is not a directory: {skill_path}")
        return None, False

    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        print(f"Error: SKILL.md not found in {skill_path}")
        return None, False

    try:
        content = skill_md.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Error reading SKILL.md: {e}")
        return None, False

    # Check frontmatter
    if not content.startswith('---'):
        print("Error: SKILL.md must start with frontmatter (---)")
        return None, False

    # Parse frontmatter
    try:
        end_idx = content.index('---', 3)
        frontmatter_text = content[3:end_idx]
        frontmatter = yaml.safe_load(frontmatter_text)
    except Exception as e:
        print(f"Error parsing frontmatter: {e}")
        return None, False

    # Check required fields
    if 'name' not in frontmatter:
        print("Error: Missing 'name' in frontmatter")
        return None, False

    if 'description' not in frontmatter:
        print("Error: Missing 'description' in frontmatter")
        return None, False

    # Validate name format
    name = frontmatter['name']
    if not re.match(r'^[a-z0-9-]+$', str(name)):
        print(f"Error: 'name' must be hyphen-case (lowercase letters, digits, hyphens only). Got: {name}")
        return None, False

    if len(str(name)) > 64:
        print(f"Error: 'name' must be 64 characters or less. Got {len(str(name))} characters")
        return None, False

    # Validate description length
    description = frontmatter.get('description', '')
    if len(str(description)) > 1024:
        print(f"Error: 'description' must be 1024 characters or less. Got {len(str(description))} characters")
        return None, False

    # Check for forbidden characters in description
    if '<' in str(description) or '>' in str(description):
        print("Error: 'description' must not contain '<' or '>' characters")
        return None, False

    # Check SKILL.md size (warning only, not error)
    if len(content) > 20000:
        print(f"Warning: SKILL.md is large ({len(content)} chars). Consider splitting into references/")

    # Check for forbidden files
    forbidden_files = ['README.md', 'CHANGELOG.md', 'INSTALLATION.md', 'LICENSE']
    for forbidden in forbidden_files:
        if (skill_path / forbidden).exists():
            print(f"Warning: Found {forbidden} — skills should not contain user-facing documentation")

    return True, f"Validation passed\n  name: {name}\n  description: {len(str(description))} chars\n  SKILL.md: {len(content)} chars"


def main():
    if len(sys.argv) < 2:
        print("Usage: quick_validate.py <path/to/skill-folder>")
        print()
        print("Example:")
        print("  quick_validate.py ./my-skill")
        sys.exit(1)

    skill_path = sys.argv[1]
    print(f"Validating skill: {skill_path}\n")

    valid, message = validate_skill(skill_path)
    if valid:
        print(message)
        sys.exit(0)
    else:
        print(f"Validation failed\n{message}")
        sys.exit(1)


if __name__ == "__main__":
    main()
