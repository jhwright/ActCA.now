# ActUp.Now Content File Formatting Guide

This guide explains how to create and format markdown content files for ActUp.Now call actions.

## File Structure

Each call action is defined in a markdown file (`.md`) with frontmatter (YAML metadata) at the top. The file must be placed in the `src/content/calls/` directory.

## Required Fields

All fields in the frontmatter are required unless marked as optional:

### `title` (required)
The display name shown on the index page. This is what users see in the navigation menu.

**Example:** `"Climate Action"` or `"High Speed Rail - NOW"`

### `officialName` (required)
The full name of the official being called.

**Example:** `"Liane Randolph"`

### `officialTitle` (required)
The official's job title or position.

**Example:** `"Chair, California Air Resources Board"`

### `phone` (required)
The phone number to call (digits only, no formatting).

**Example:** `"9163222990"` (will be formatted as (916) 322-2990)

### `script` (required)
The call script that users will read when making the call. This should be a complete, professional message.

**Special placeholder:** Use `[ZIP]` in the script to automatically insert the user's zip code.

**Example:**
```
"I'm calling to urge Chair Randolph to aggressively implement California's independent climate standards. As a voter in zip code [ZIP], I support the implementation of the Climate Corporate Data Accountability Act (SB 253). Thank you."
```

### `priority` (optional, default: `false`)
Set to `true` to mark this call as urgent. Urgent calls display an "URGENT" badge.

**Example:** `true` or `false`

### `rationale` (required)
A detailed explanation of why this call action is important. This appears in an expandable section on the call page.

**Example:**
```
"California's climate leadership is essential for protecting our environment and economy. By implementing Senate Bills 253 and 254, California asserts its authority to require corporate transparency on emissions and financial risks, setting a global standard independent of federal policy shifts."
```

## Complete Example

Here's a complete example of a properly formatted content file:

```markdown
---
title: "Climate Action"
officialName: "Liane Randolph"
officialTitle: "Chair, California Air Resources Board"
phone: "9163222990"
script: "I'm calling to urge Chair Randolph to aggressively implement California's independent climate standards and defend our state's climate sovereignty. As a voter in zip code [ZIP], I support the implementation of the Climate Corporate Data Accountability Act (SB 253) and other measures that exceed federal requirements. We must ensure that California's transition to 100% renewable energy and zero-emission vehicles remains on track, regardless of federal policy shifts. Our climate future depends on California's continued leadership and autonomy. Thank you."
priority: false
rationale: "California's climate leadership is essential for protecting our environment and economy. By implementing Senate Bills 253 and 254, California asserts its authority to require corporate transparency on emissions and financial risks, setting a global standard independent of federal policy shifts. Our state's cap-and-trade program and 100% renewable energy mandate (SB 100) demonstrate that we can reduce emissions while growing the world's 5th largest economy. Strengthening California's climate sovereignty ensures that our progress on zero-emission vehicles and carbon neutrality remains resilient against federal inaction or reversals. CARB's role is critical in maintaining this independence and ensuring California remains a global beacon for climate action."
---

```

## Formatting Tips

1. **YAML Frontmatter**: The frontmatter must be enclosed in `---` markers at the start and end
2. **Quotes**: All string values should be wrapped in double quotes (`"`)
3. **Booleans**: Use `true` or `false` (lowercase) for the `priority` field
4. **Line Breaks**: Multi-line strings in YAML can use `|` or `>` for better readability
5. **File Naming**: Choose a descriptive filename (e.g., `climate.md`)

## Validation

Before submitting, ensure:
- All required fields are present
- Phone number contains only digits
- The script includes `[ZIP]` placeholder if you want zip code personalization
- YAML syntax is correct (proper indentation, quotes, etc.)

## Questions?

If you have questions about formatting or need help creating a content file, please contact the ActUp.Now team.

