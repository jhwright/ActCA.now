# Cursor Rules Summary

This document explains which `.mdc` rule files apply to which project.

## ActCA.now Project Rules

Located in: `/Users/jeff/code/ActCA.now/actca-now/.cursor/rules/`

### 1. `actca.mdc`
- **Applies to**: `src/**/*.{astro,ts,js}`
- **Purpose**: ActCA.now-specific development standards
- **Key Rules**:
  - Maintain "Bridge AI" scannability with heading comments
  - Thumb-First UI: Action buttons must be min-height 60px
  - Use Git-based content collections for all political targets

### 2. `flowbite-standards.mdc`
- **Applies to**: `src/**/*.{astro,ts,js,css}`
- **Purpose**: Enforce strict Flowbite component usage
- **Key Rules**:
  - Use only Flowbite components from `flowbite-astro` and Tailwind utility classes
  - NO custom CSS classes, NO inline styles, NO style attributes
  - Use Flowbite components: `<Button>`, `<Card>`, `<TextInput>`, etc.

### 3. `cursor_project_spec.md`
- **Applies to**: No globs specified (general project documentation)
- **Purpose**: Complete project specification and coding standards
- **Key Topics**:
  - Astro 5.0 technical stack
  - Content schema (Zod)
  - UI logic and state management
  - Cursor agent directives

---

## Bridge AI Project Rules

Located in: `/Users/jeff/code/bridge-ai/.cursor/rules/`

### Base Rules
- **`00-bridgeai-base.mdc`**: Core principles, AI thrash prevention, Python execution requirements (Poetry), change workflow
- **` bridge-arch.mdc`**: Architecture rules (always apply)
- **`bridge-card-standards.mdc`**: Card documentation standards (always apply)

### Style & Architecture
- **`10-python-style.mdc`**: Python coding style guidelines
- **`20-django-architecture.mdc`**: Django architecture patterns
- **`25-css-naming.mdc`**: **CRITICAL** - Bridge CSS class naming (`bridge-*` classes, no inline styles)
- **`30-domains-and-cards.mdc`**: Domain organization and card documentation

### Development Workflow
- **`40-testing.mdc`**: Testing requirements and standards
- **`50-db-and-migrations.mdc`**: Database and migration rules
- **`60-pr-and-ci.mdc`**: Pull request and CI/CD standards
- **`70-security.mdc`**: Security guidelines
- **`80-build-automation.mdc`**: Build automation and logging requirements

### Compliance & Extraction
- **`bridge-compliance.mdc`**: Applies to `tests/**/*.py` and `docs/cards/tests/*.md`
- **`bridge-extraction.mdc`**: Extraction rules (always apply)

---

## Key Differences

### CSS/Styling
- **ActCA.now**: Uses Flowbite components + Tailwind utilities (no custom CSS)
- **Bridge AI**: Uses custom `bridge-*` CSS classes (no inline styles, no Bootstrap/Flowbite)

### Framework
- **ActCA.now**: Astro 5.0 (static-first SSG)
- **Bridge AI**: Django + Postgres (Python/Poetry-based)

### Code Organization
- **ActCA.now**: Content collections, Astro components, Netlify functions
- **Bridge AI**: Django domains, services, cards documentation

---

## Note on "Bridge AI" Legacy

The ActCA.now rules mention maintaining "Bridge AI" scannability with heading comments. This refers to a coding style (heavy use of heading comments for modularity) that should be maintained in ActCA.now, not the Bridge AI project's rules themselves.


