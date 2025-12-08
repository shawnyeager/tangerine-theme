# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ CRITICAL RULES

**NEVER PUSH TO GITHUB WITHOUT EXPLICIT PERMISSION**

- Do NOT run `git push` without the user explicitly saying "push" or "ship it"
- This applies to ALL repositories: tangerine-theme, shawnyeager-com, shawnyeager-notes
- Commits are fine. But NEVER push without permission.
- When the user says "ship it", that means push. Otherwise, ASK FIRST.

**DEBUGGING CSS ISSUES: CHECK DEPLOYED ASSETS FIRST**

- When user reports a visual/CSS bug on the live site, ALWAYS check the deployed CSS file FIRST
- Use `curl -s https://[site-url]/css/main.min.[hash].css` to inspect what's actually deployed
- Compare deployed CSS to source CSS in the repo
- Check `go.mod` versions in consuming sites vs latest master branch commit in theme repo
- Don't theorize about browser behavior or CSS cascade issues until you've confirmed source matches deployment
- User observations like "only this ONE element behaves differently" are critical clues - investigate the deployment version mismatch

**THEME CHANGES DEPLOY VIA MASTER BRANCH**

- CSS changes committed to theme master branch trigger GitHub Actions to update consuming sites
- Sites track master branch via Hugo Modules (no version tags required)
- When making CSS fixes: commit to master → push to GitHub
- "Ship it" for theme repo means: commit + push
- GitHub Actions automatically runs `hugo mod get -u` in both consuming sites

**ALWAYS USE DESIGN TOKENS - NEVER HARDCODE VALUES**

- This design system is built on CSS custom properties (design tokens)
- ALWAYS use tokens for colors, spacing, typography, etc.
- NEVER hardcode pixel values, hex colors, or font weights
- Check `assets/css/main.css` for available tokens (see TOC at top of file)
- Examples:
  - ✅ `font-size: var(--font-lg);`
  - ❌ `font-size: 18px;`
  - ✅ `margin-top: var(--space-xl);`
  - ❌ `margin-top: 32px;`
  - ✅ `color: var(--text-primary);`
  - ❌ `color: #1a1a1a;`
  - ✅ `font-weight: var(--font-weight-semibold);`
  - ❌ `font-weight: 600;`
- If a value doesn't have a token, ask before creating a new token or hardcoding
- Comments should reference token names, not pixel values

---

# tangerine-theme

**Shared Hugo theme module for shawnyeager.com and shawnyeager.notes**

## Architecture Overview

This is a **Hugo theme module** - it cannot run standalone and has no content of its own. It provides:
- Shared layouts and templates
- Design system CSS (main.css)
- Common partials (header, footer, navigation, page-title)
- Parameterized templates that adapt based on site configuration

Both .com (The Gallery) and .notes (The Workshop) sites import this module via Hugo Modules.

**Key Architecture Pattern:**
Templates use Hugo parameters to adapt behavior (e.g., `content_type` switches between "essays" and "notes" terminology). This allows one theme to serve multiple sites with different content types while maintaining consistent design.

## Repository Structure

```
tangerine-theme/
├── CLAUDE.md                    # This file
├── README.md                    # Quick reference guide
├── hugo.toml                    # Shared params (merged into sites)
├── docs/                        # Documentation
│   ├── BRAND_MESSAGING_BIBLE.md        # Brand voice, messaging, positioning
│   ├── DESIGN_SYSTEM_SPECIFICATION.md  # Complete design system specs
│   └── PLAUSIBLE_SETUP.md              # Analytics setup guide
├── layouts/
│   ├── _default/
│   │   ├── baseof.html         # Base template wrapper
│   │   ├── list.html           # List pages
│   │   ├── single.html         # Single pages
│   │   ├── taxonomy.html       # Topic/tag pages
│   │   └── terms.html          # Topic/tag listing
│   └── partials/
│       ├── head.html           # HTML head (meta, CSS)
│       ├── header.html         # Site header
│       ├── navigation.html     # Nav menu
│       ├── footer.html         # Site footer
│       └── page-title.html     # Smart page title visibility (see below)
├── assets/
│   └── css/
│       └── main.css            # Complete design system (processed by Hugo Pipes)
├── static/
│   └── fonts/                  # Satoshi + Inter variable fonts
└── theme.toml                  # Theme metadata
```

## Documentation

**Key documentation files in `docs/`:**

- **DESIGN_SYSTEM_SPECIFICATION.md** - Complete design system documentation including:
  - Color system (light/dark mode)
  - Typography scale and font specifications
  - Spacing system
  - Component styles
  - WCAG compliance details

- **PLAUSIBLE_SETUP.md** - Analytics setup guide including:
  - Goal configuration for both sites
  - Event tracking architecture
  - Verification checklist
  - Troubleshooting

## Design System

**File:** `assets/css/main.css`

Complete CSS implementing the design system:
- CSS custom properties for theming
- Light and dark mode (using `prefers-color-scheme`)
- Responsive design
- Typography scale
- Spacing system
- Component styles

**Key Design Principles:**
- Satoshi variable font (headings/UI) + Inter variable font (body text)
- Trust Revolution Orange (#d63900 light, #FF5733 dark)
- WCAG AA contrast compliance
- 700px max-width container
- Perfect fourth typography scale (1.333 ratio)

**For complete specifications:** See `docs/DESIGN_SYSTEM_SPECIFICATION.md`

## Shared Configuration (hugo.toml)

**File:** `hugo.toml` (23 lines)

The theme provides shared parameters that are automatically merged into consuming sites:

```toml
[params]
  copyright = "Copyright © 2025, Shawn Yeager"
  nostr = "https://primal.net/shawn"
  github = "https://github.com/shawnyeager"
  twitter_handle = "shawnyeager"

  [params.author]
    name = "Shawn Yeager"
    email = "hello@shawnyeager.com"
    jobTitle = "Bitcoin Go-to-Market Leader"
```

**Hugo's Module Config Merge Behavior:**

- **Merged automatically**: `[params]` and `[[menu.*]]` sections
- **NOT merged**: Top-level config like `[markup]`, `[imaging]`, `[taxonomies]`, etc.
- Sites can override any theme param by defining the same key in their hugo.toml
- Merge strategy: Deep merge for params (site values take precedence)

**Why this split?**
- Hugo's module system only merges params and menus from theme configs
- All other configuration (markup, imaging, security, etc.) must be in site files
- This centralizes shared values (copyright, social links, author info) while keeping site-specific config separate

## How Sites Use This Theme

Both sites import this theme via Hugo Modules in their `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/shawnyeager/tangerine-theme"
```

**Local Development vs Production:**
- **Local:** Use `hugo mod get -u` to update consuming sites to latest theme version for testing
- **Production (Netlify):** Fetches from GitHub at version locked in `go.mod`
- Sites always use GitHub path in `hugo.toml`
- **Theme is public:** No authentication required for module fetching

**Sites can override any template** by creating the same file in their own `layouts/` directory.

### Required Site Configuration Parameters

Sites using this theme must configure these parameters in their `hugo.toml`:

```toml
[params]
  # Core settings (REQUIRED)
  content_type = "essays"           # "essays" or "notes" - affects terminology
  favicon_style = "solid"           # "solid" or "outlined"
  noindex = false                   # true to block search engines

  # Email signup (optional)
  show_email_signup = true          # Show email form in footer
  email_signup_text = "I send new essays and updates via email."
  email_signup_action = "https://buttondown.com/api/emails/embed-subscribe/username"

  # Social links (optional)
  nostr = "https://nostr.example.com"
  github = "https://github.com/username"
  email = "hello@example.com"

  # Cross-site link (optional)
  secondary_site_url = "https://other-site.com"
  secondary_site_name = "Other Site"
```

## Template Overrides by Site

**.com site overrides:**
- `layouts/index.html` - Custom homepage with bio, latest essay, podcast, topics
- `layouts/essays/` - Essay-specific templates
- `layouts/partials/page-title.html` - Override to show/hide page titles

**.notes site overrides:**
- `layouts/index.html` - Simple homepage with workshop intro
- `layouts/notes/` - Note-specific templates
- `layouts/partials/page-title.html` - Override to show/hide page titles

## Page Title Visibility System (page-title.html)

The theme provides a **smart page-title partial** that handles semantic H1 titles with smart visibility based on page type.

**How it works:**
- **Logic:** Uses Hugo context variables (Type, Kind, and frontmatter `show_title` flag) to determine visibility
- **Implementation:** H1 uses semantic markup with optional `sr-only` class for screen readers
- **Pattern:** Sites can override with custom logic for their specific needs

**Usage in templates:**
```go
{{ partial "page-title.html" . }}
```

**Consuming sites should document:**
- Which page types show titles (e.g., individual essays/notes always visible)
- Which pages use the `show_title: true` frontmatter flag
- Which pages hide titles with `sr-only` (utility pages)

**Example override patterns:**

Shawnyeager-com (essays site):
- Individual essays: Type=essays AND Kind!=section → Show H1 title (visible)
- Essays listing: Type=essays AND Kind=section → Hide H1 title (sr-only)
- Feature pages: Frontmatter `show_title: true` → Show H1 title (visible)

Shawnyeager-notes (notes site):
- Individual notes: Type=notes AND Kind!=section → Show H1 title (visible)
- Notes listing: Type=notes AND Kind=section → Hide H1 title (sr-only)

**See consuming site's CLAUDE.md for complete documentation on page-title visibility logic.**

## Local Development

**Architecture:** Theme is imported via Hugo Modules from GitHub.

**How local dev works:**
- Sites use a `replace` directive in `go.mod` pointing to `../tangerine-theme`
- This makes theme changes appear immediately without `hugo mod get`
- Just edit theme files and refresh browser

**Testing workflow:**
1. Use `./theme-dev.sh` script from workspace root to start dev servers
2. Make changes to theme files
3. Refresh browser - changes appear instantly
4. Commit theme changes when ready
5. Push to master to trigger automated site updates

**Important:** Never commit replace directives to site repos - they break Netlify builds.

## Making Theme Changes

### Hugo Module Workflow

**The workflow is simple: develop locally, then push to master.**

#### Local Development and Testing

```bash
# Start dev servers using the theme-dev.sh script
cd ~/Work/shawnyeager
./theme-dev.sh        # Start both sites
./theme-dev.sh com    # Start only Gallery (port 1313)
./theme-dev.sh notes  # Start only Workshop (port 1316)

# Make changes to theme
cd ~/Work/shawnyeager/tangerine-theme
# Edit CSS, layouts, templates...
# Refresh browser - changes appear instantly

# When ready, commit locally
git add -A
git commit -m "Description of changes"
```

#### Publishing Theme Changes

**Sites now use PR-based workflow for theme updates.**

When local testing is complete, push to master:

```bash
cd ~/Work/shawnyeager/tangerine-theme
git push origin master
```

**Then trigger site updates manually:**

```bash
# Trigger in both sites (or wait for daily cron at 9am UTC)
gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-com
gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-notes
```

**GitHub Actions workflow:**
1. Detects theme updates in go.mod
2. Creates Pull Request (not direct commit to master)
3. Netlify builds FREE deploy preview
4. You review preview URL in PR
5. Manually merge PR when satisfied
6. Netlify builds production (15 credits per site)

**Cost savings:**
- Deploy previews: FREE (0 credits)
- Multiple theme commits accumulate in one PR
- Only pay for final production build

**Verification:**

```bash
# Check workflow created PRs
gh pr list --repo shawnyeager/shawnyeager-com --label theme-update
gh pr list --repo shawnyeager/shawnyeager-notes --label theme-update

# After merging PRs, verify production updated
cd ~/Work/shawnyeager/shawnyeager-com && git pull && grep tangerine-theme go.mod
cd ~/Work/shawnyeager/shawnyeager-notes && git pull && grep tangerine-theme go.mod
```

**Manual override ONLY if workflow fails:**

If workflow doesn't create PR:
1. Check workflow status: `gh run list --repo shawnyeager/shawnyeager-com`
2. If failed, manually update and commit go.mod in site repos

### Version Management

This theme tracks the master branch rather than using version tags:
- **Deployment:** Sites automatically pull latest master branch changes via GitHub Actions
- **CSS Version Header:** The version comment in `assets/css/main.css` (line 4) can be updated optionally for major changes
- **No Tagging Required:** Commits to master automatically propagate to consuming sites
- **Simplicity:** No need to manage version numbers or git tags for routine changes

### Reverting Theme Changes

When you need to revert theme changes that have already been pushed:

```bash
# 1. Revert theme repo
cd ~/Work/shawnyeager/tangerine-theme
git reset --hard <commit-hash>
git push --force origin master

# 2. Trigger PR workflows to update sites
gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-com
gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-notes

# 3. Review PRs with reverted theme
# 4. Merge when satisfied
```

**Why this works:**
- Workflow detects go.mod changes (theme commit hash changed)
- Creates PR with reverted theme version
- Deploy preview shows reverted state
- Merge to deploy revert to production

### Testing Checklist

When making CSS or layout changes:
- ✅ Test light and dark mode
- ✅ Test responsive (mobile, tablet, desktop)
- ✅ Test both .com and .notes sites
- ✅ Verify WCAG AA contrast compliance for color changes
- ✅ Verify page-title partial works with consuming site overrides

## Related Repositories

- **shawnyeager-com**: The Gallery (professional site)
  - `github.com/shawnyeager/shawnyeager-com`
  - Imports this theme
  - Overrides: homepage, essays templates, page-title partial

- **shawnyeager-notes**: The Workshop (notes/WIP)
  - `github.com/shawnyeager/shawnyeager-notes`
  - Imports this theme
  - Overrides: homepage, notes templates, page-title partial
  - Indexed by search engines (noindex = false)

## Testing Locally

**This theme cannot be run standalone.** It must be tested through one of the sites that use it.

**Testing workflow:**

```bash
# Start dev servers (handles replace directive and cache clearing)
cd ~/Work/shawnyeager
./theme-dev.sh        # Start both sites
./theme-dev.sh com    # Start only Gallery (port 1313)
./theme-dev.sh notes  # Start only Workshop (port 1316)

# Make changes to theme files
# Refresh browser - changes appear instantly
```

When ready to publish to production (Netlify), push the theme changes to master branch.

## Hugo Module Commands

```bash
# Update theme in a site to latest version
hugo mod get -u github.com/shawnyeager/tangerine-theme

# Clean module cache (if having issues)
hugo mod clean

# View module dependency tree
hugo mod graph
```

