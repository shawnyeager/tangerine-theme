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

### Never Commit Replace Directives
**Replace directives are for LOCAL testing ONLY. NEVER commit them to site repos.**

When testing theme changes locally:
- ✅ Add `replace` to go.mod (NOT committed)
- ✅ Test changes with Hugo server
- ❌ **NEVER** run `git add go.mod` if it contains replace directive
- ✅ Use `git restore go.mod` before committing

**Pre-commit check before ANY site repo commit:**
```bash
# Verify go.mod has no replace directive:
git diff go.mod | grep "replace"  # Should return nothing
```

**Why this matters:** Netlify can't access `../tangerine-theme` (outside repo), builds fail with module download errors.

**If you accidentally commit it:** Immediately fix with `git restore go.mod`, commit removal, and push.

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
2. Ensures replace directive in go.mod (with proper newline)
3. Cleans Hugo module cache (`hugo mod clean`)
4. Clears resources and public directories
5. Starts Hugo servers

**DO NOT manually start Hugo servers for theme testing. The script exists because:**
- Replace directives must have a leading newline or go.mod is malformed
- Hugo caches modules aggressively - `hugo mod clean` is required
- Stale resources/public directories cause CSS hash conflicts

After starting: Edit theme files → refresh browser → see changes instantly.

**Important:** Once you push theme changes to GitHub, DO NOT manually update sites - GitHub Actions handles that automatically.

### Publishing Theme Changes

Theme publishing uses **PR-based workflow via GitHub Actions**:

**When you push theme changes:**

1. Commit and push theme to master branch:
   ```bash
   cd ~/Work/shawnyeager/tangerine-theme
   git add -A
   git commit -m "Description of changes"
   git push origin master
   ```

2. Manually trigger update workflows in both sites:
   ```bash
   # Trigger in shawnyeager-com
   gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-com

   # Trigger in shawnyeager-notes
   gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-notes
   ```

3. Wait 2-3 minutes for GitHub Actions to create PRs

4. Review deploy previews (FREE - 0 credits)

5. Merge PRs when satisfied (triggers production builds - 15 credits each)

**Cost savings:**
- Deploy previews: FREE (0 credits)
- Only pay when merging PR to production
- Multiple theme commits accumulate in one PR

**Sites track master branch - no version tagging needed.**

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

### PR-Based Theme Update Workflow

Theme changes trigger manual PR creation via GitHub Actions:
1. Push to `tangerine-theme` master branch
2. Manually trigger workflows in both site repos (or wait for daily cron)
3. GitHub Actions creates PR with theme updates
4. Netlify builds FREE deploy preview for the PR
5. Review preview, then manually merge PR
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