# CLAUDE.md - Workspace Guide

This workspace contains 4 integrated repositories for shawnyeager.com and notes.shawnyeager.com.

**⚠️ PRIVATE WORKSPACE:** This is a private workspace directory. Public repositories have their own CLAUDE.md files with public-safe information only.

---

## Repositories

Each repository has its own detailed CLAUDE.md file with complete documentation:

### shawnyeager-com (The Gallery)
**Location:** `shawnyeager-com/CLAUDE.md`

Finished essays and professional content site.
- Site configuration and content guidelines
- Essay frontmatter requirements
- Image requirements and validation
- Deployment and verification

### shawnyeager-notes (The Workshop)
**Location:** `shawnyeager-notes/CLAUDE.md`

Work-in-progress notes and thinking in public.
- Site configuration and content guidelines
- Note frontmatter structure
- Deployment checklist

### tangerine-theme (Shared Theme Module)
**Location:** `tangerine-theme/CLAUDE.md`

Hugo theme module providing shared layouts, design system, and components.
- Theme architecture and module workflow
- Design system tokens and guidelines
- Template documentation
- Publishing workflow (automated via GitHub Actions)

**Complete documentation:** `tangerine-theme/docs/`
- `DESIGN_SYSTEM_SPECIFICATION.md` - Colors, typography, spacing, WCAG compliance
- `PLAUSIBLE_SETUP.md` - Analytics setup and event tracking

### shared-workflows (GitHub Actions)
**Location:** `shared-workflows/README.md`

Reusable GitHub Actions workflows for content quality and validation.
- Link checking
- Markdown linting
- Frontmatter validation
- Image alt text validation
- Hugo module validation

---

## ⚠️ CRITICAL RULES (All Repos)

### Never Push Without Permission
- Do NOT run `git push` without explicit permission
- User must say "push" or "ship it"
- Commits and tags are fine, but never push automatically

### Always Use Design Tokens
- NEVER hardcode pixel values, hex colors, or font weights
- ALWAYS use CSS custom properties from tangerine-theme
- Check `tangerine-theme/assets/css/main.css` for available tokens
- Examples:
  - ✅ `font-size: var(--font-lg);` ❌ `font-size: 18px;`
  - ✅ `color: var(--text-primary);` ❌ `color: #1a1a1a;`

### Essay Commits: Squash and No AI Attribution
**ALWAYS squash essay commits before pushing to origin.** Single clean commit only.

**NEVER include AI attribution in commits:**
- No "Generated with Claude Code"
- No "Co-Authored-By: Claude"
- No robot emojis
- Commit messages must look human-written

Essay commits become permanent public record.

### Replace Directives (Automated Safety)

**Replace directives are handled automatically - you cannot commit them by accident.**

**Safety layers:**
1. **Pre-commit hook** - BLOCKS any commit containing replace directive (all branches)
2. **theme-dev.sh cleanup** - Automatically removes replace directive when you stop the dev server (Ctrl+C)

**If you see a blocked commit:**
```bash
git restore go.mod        # Remove replace directive
git add go.mod            # Re-stage clean version
```

### Theme Deployment (Fully Automated)

**When user says "go", "ship it", or "push" after theme work:**

1. Push theme: `git -C tangerine-theme push origin master`
2. **DONE.** GitHub Actions automatically triggers site PRs.
3. Wait ~3 min for PRs to appear
4. User reviews deploy previews
5. User merges PRs

**No manual workflow triggers needed.** The theme repo has a GitHub Action that automatically triggers site update workflows when you push to master.

**FORBIDDEN:**
- DO NOT push existing local branches to site repos
- DO NOT create PRs manually from local branches
- DO NOT run `hugo mod get` in site repos

---

## Quick Start

### Local Development

**The Gallery (.com):**
```bash
cd ~/Work/shawnyeager/shawnyeager-com
hugo server -D -p 1313
```

**The Workshop (notes.shawnyeager.com):**
```bash
cd ~/Work/shawnyeager/shawnyeager-notes
hugo server -D -p 1316
```

### Testing Theme Changes Locally (BEFORE Publishing)

**MANDATORY: Use the theme-dev.sh script to start dev servers:**

```bash
cd ~/Work/shawnyeager
./theme-dev.sh        # Start both sites
./theme-dev.sh com    # Start only Gallery
./theme-dev.sh notes  # Start only Workshop
```

The script handles everything:
1. Kills existing Hugo servers
2. Adds replace directive to go.mod
3. Cleans Hugo module cache (`hugo mod clean`)
4. Clears resources and public directories
5. Starts Hugo servers
6. **Automatically cleans up replace directive when you Ctrl+C**

After starting: Edit theme files → refresh browser → see changes instantly.

**When you stop the dev server (Ctrl+C)**, the script automatically removes the replace directive from go.mod, leaving it safe to commit.

### Publishing Theme Changes

Theme publishing is **fully automated via GitHub Actions**:

**When you push theme changes:**

1. Commit and push theme to master branch:
   ```bash
   cd ~/Work/shawnyeager/tangerine-theme
   git add -A
   git commit -m "Description of changes"
   git push origin master
   ```

2. **DONE.** GitHub Actions automatically:
   - Triggers site update workflows in both repos
   - Creates PRs with theme updates (~3 min)

3. Review deploy previews (FREE - 0 credits)

4. Merge PRs when satisfied (triggers production builds - 15 credits each)

**No manual workflow triggers needed.** Push theme → PRs appear automatically.

---

## Architecture Overview

### Hugo Modules Pattern
- Both sites import `tangerine-theme` via Hugo Modules
- Theme provides layouts, CSS, and shared components
- Sites can override any template by creating the same file locally
- **Local dev:** Both sites have `replace` directive in go.mod pointing to `../tangerine-theme`
  - This makes Hugo use the local theme directory automatically
  - No need to run `hugo mod get` - changes are immediately visible
- **Production:** GitHub Actions automatically removes replace directive when deploying
  - Netlify fetches theme from GitHub master branch (theme is public)
  - Sites track latest master branch commit in go.mod
  - Replace directive is auto-managed - don't add/remove it manually

### Two-Domain Strategy
- **shawnyeager.com** = The Gallery (finished work, SEO indexed)
- **notes.shawnyeager.com** = The Workshop (WIP, SEO indexed)

### Automated Theme Update Workflow

Theme changes automatically trigger PRs in both site repos:
1. Push to `tangerine-theme` master branch
2. GitHub Actions in theme repo triggers site update workflows
3. Site workflows create PRs with theme updates (~3 min)
4. Netlify builds FREE deploy preview for each PR
5. Review previews, then merge PRs
6. Netlify builds production (15 credits × 2 sites = 30 credits)

---

## Philosophy

**The Gallery (.com):** Finished, polished work. Public-facing professional content.

**The Workshop (notes.shawnyeager.com):** Work in progress, thinking in public. No perfection required.

Ideas graduate from The Workshop to The Gallery.

---

## Key Constraints

1. Never commit `public/` directory (build artifact)
2. Preserve essay permalinks on .com (changing breaks existing URLs)
3. Design tokens only (never hardcode values)
4. Never push without permission
5. Match theme module path in both sites (GitHub URL)

---

**For detailed documentation, see each repository's CLAUDE.md file.**
- You are forbidden from blaming your mistakes on browser caching or Netlify build processes. You will take full responsibility for your mistakes and fix them.