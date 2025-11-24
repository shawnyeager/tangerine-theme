# Tangerine Theme

Hugo theme module shared between shawnyeager.com and notes.shawnyeager.com. A minimal, flexible theme for essays and notes with clean typography, dark mode support, and parameterized templates.

## Features

- Inter variable font with nuanced weight system (450 UI / 400 reading)
- Clean, readable typography with perfect fourth scale (1.333 ratio)
- Automatic dark mode with weight compensation (follows system preference)
- Responsive design (mobile-first, max-width: 700px)
- Parameterized templates (essays vs notes)
- Smart page title visibility system for semantic HTML
- RSS feed support
- Privacy-friendly analytics (Plausible)
- Accessibility-focused (semantic HTML, ARIA labels, WCAG AA compliant)

## Installation

### As a Hugo Module (Production)

```toml
# hugo.toml
[module]
  [[module.imports]]
    path = "github.com/shawnyeager/tangerine-theme"
```

Then run:
```bash
hugo mod get -u
```

### Local Development

For local theme development, use Hugo Modules:

1. Make changes to the theme and commit locally
2. In consuming sites, run `hugo mod get github.com/shawnyeager/tangerine-theme@master`
3. Test with `hugo server`

Sites always specify the GitHub path in their `hugo.toml` and track the master branch. See [Development Workflow](#development-workflow) for details.

## Required Configuration

Add these parameters to your site's `hugo.toml`:

```toml
[params]
  # Theme configuration (REQUIRED)
  content_type = "essays"           # "essays" or "notes"
  favicon_style = "solid"           # "solid" or "outlined"
  noindex = false                   # true to block search engines

  # Author information (REQUIRED - used in RSS, structured data, social cards)
  copyright = "Copyright © 2025, Your Name"
  twitter_handle = "yourhandle"     # Without @ symbol

  [params.author]
    name = "Your Name"
    email = "hello@example.com"
    description = "Your professional description"
    jobTitle = "Your Job Title"
    image = "/images/author.jpg"

  [params.author.sameAs]
    linkedin = "https://www.linkedin.com/in/username"
    github = "https://github.com/username"
    nostr = "https://nostr.profile.url"
    podcast = "https://podcast.url"  # optional

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

## Configuration Parameters

### Core Settings (Required)

| Parameter | Type | Description |
|-----------|------|-------------|
| `content_type` | string | Content type: "essays" or "notes". Affects terminology in templates. |
| `favicon_style` | string | Favicon: "solid" (filled square) or "outlined" (outlined square). |
| `noindex` | boolean | Block search engines. Set `true` for workshop/notes sites. |

### Author Information (Required)

| Parameter | Type | Description |
|-----------|------|-------------|
| `copyright` | string | Copyright notice. Used in structured data. |
| `twitter_handle` | string | Twitter handle without @ symbol. Used for Twitter Card attribution. |
| `params.author.name` | string | Author full name. Used in RSS, structured data, meta tags. |
| `params.author.email` | string | Author email. Used in RSS feed. |
| `params.author.description` | string | Short professional description. Used in structured data. |
| `params.author.jobTitle` | string | Professional job title. Used in structured data. |
| `params.author.image` | string | Path to author image. Used in structured data. |
| `params.author.sameAs.linkedin` | string | LinkedIn profile URL. Used in structured data. |
| `params.author.sameAs.github` | string | GitHub profile URL. Used in structured data and footer. |
| `params.author.sameAs.nostr` | string | Nostr profile URL. Used in structured data and footer. |
| `params.author.sameAs.podcast` | string | Podcast URL (optional). Used in structured data. |

### Email Signup (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `show_email_signup` | boolean | Show email subscription form in footer. Default: false. |
| `email_signup_text` | string | Intro text above form. Default: "I send new essays and updates via email." |
| `email_signup_action` | string | Form action URL (e.g., Buttondown endpoint). Required if `show_email_signup=true`. |

### Links (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `nostr` | string | Nostr profile URL (shows in footer). |
| `github` | string | GitHub profile URL (shows in footer). |
| `email` | string | Contact email (shows in footer). |
| `secondary_site_url` | string | Cross-linked site URL (e.g., notes from essays). |
| `secondary_site_name` | string | Display name for cross-linked site. |

## Template Structure

### Layouts Included

- `_default/baseof.html` - Base template (all pages inherit)
- `_default/single.html` - Single pages
- `_default/list.html` - List pages
- `_default/taxonomy.html` - Single taxonomy page (parameterized)
- `_default/terms.html` - Taxonomy terms list (parameterized)
- `partials/head.html` - HTML head (meta tags, favicon, analytics)
- `partials/header.html` - Site header
- `partials/navigation.html` - Main navigation
- `partials/footer.html` - Footer (email signup + links)
- `partials/page-title.html` - Smart page title visibility (see below)

### Static Assets

- `static/css/main.css` - Complete design system
- `static/fonts/inter-variable.woff2` - Inter variable font (weights 100-900)

### Smart Page Title Visibility (page-title.html)

The theme includes a **`page-title.html` partial** that handles semantic H1 page titles with smart visibility logic:

**How it works:**
- Renders an H1 with optional `sr-only` class based on page type and context
- Consuming sites can override with custom logic for their specific needs
- Enables proper semantic HTML hierarchy without forcing visual display

**Usage in templates:**
```go
{{ partial "page-title.html" . }}
```

**Example implementation patterns:**

**Essays site (shawnyeager-com):**
- Individual essays: Show H1 title (visible)
- Essays listing: Hide H1 title (sr-only for accessibility)
- Feature pages: Use `show_title: true` frontmatter to show title

**Notes site (notes.shawnyeager-com):**
- Individual notes: Show H1 title (visible)
- Notes listing: Hide H1 title (sr-only for accessibility)

**Customization:**
Sites can override `layouts/partials/page-title.html` with custom logic to fit their content structure and accessibility needs.

See consuming site's CLAUDE.md for complete page-title visibility documentation.

### Overriding Templates

Sites can override any template by creating a file at the same path:

```
your-site/
└── layouts/
    ├── index.html          # Override homepage
    ├── essays/
    │   ├── list.html       # Override essays archive
    │   └── single.html     # Override essay pages
    └── partials/
        └── page-title.html # Override page title logic
```

## Example Configurations

### Essays Site (.com)

```toml
[params]
  content_type = "essays"
  favicon_style = "solid"
  noindex = false

  copyright = "Copyright © 2025, Your Name"
  twitter_handle = "yourhandle"

  show_email_signup = true
  email_signup_action = "https://buttondown.com/api/emails/embed-subscribe/username"
  nostr = "https://nostr.example.com"
  github = "https://github.com/username"
  email = "hello@example.com"
  secondary_site_url = "https://notes.example.com"
  secondary_site_name = "Notes"

[params.author]
  name = "Your Name"
  email = "hello@example.com"
  description = "Your professional description"
  jobTitle = "Your Job Title"
  image = "/images/author.jpg"

[params.author.sameAs]
  linkedin = "https://www.linkedin.com/in/username"
  github = "https://github.com/username"
  nostr = "https://nostr.example.com"
  podcast = "https://podcast.url"
```

### Notes Site (notes. subdomain)

```toml
[params]
  content_type = "notes"
  favicon_style = "outlined"
  noindex = false

  copyright = "Copyright © 2025, Your Name"
  twitter_handle = "yourhandle"

  show_email_signup = false
  nostr = "https://nostr.example.com"
  github = "https://github.com/username"
  secondary_site_url = "https://www.example.com"
  secondary_site_name = "Essays"

[params.author]
  name = "Your Name"
  email = "hello@example.com"
  description = "Your professional description"
  jobTitle = "Your Job Title"
  image = "/images/author.jpg"

[params.author.sameAs]
  linkedin = "https://www.linkedin.com/in/username"
  github = "https://github.com/username"
  nostr = "https://nostr.example.com"
```

## Design System

### Colors

- Brand Orange (light): `#d63900` (text implementation, WCAG AA compliant)
- Brand Orange (dark): `#FF5733` (text implementation, WCAG AA compliant)
- Visual brand: `#F84200` (used in brand bar, podcast art)
- Background (light): `#ffffff` (white)
- Background (dark): `#1e1e1e` (near black, 14.4:1 contrast)
- Text primary (light): `#1a1a1a` (16.1:1 contrast)
- Text primary (dark): `#e8e8e8` (14.4:1 contrast)
- Text secondary (light): `#444` (7.5:1 contrast)
- Text secondary (dark): `#b8b8b8` (5.5:1 contrast)
- All color combinations are WCAG AA compliant for accessibility

### Typography

- Inter variable font (weights 100-900) with system font fallbacks
- Nuanced weight system: 450 for UI text, 400 for long-form reading
- Perfect fourth typography scale (1.333 ratio)
- Custom tokens for page titles (32px) and section headers (24px)
- Dark mode weight compensation for optical correctness
- Responsive font sizes optimized for readability

### Layout

- Max-width: 700px (optimal reading line length)
- Mobile-first responsive design
- Automatic dark mode (respects `prefers-color-scheme`)

## Development Workflow

### Local Development with Git Modules

This theme uses Hugo Modules imported from GitHub:

**How it works:**
- Sites specify `path = "github.com/shawnyeager/tangerine-theme"` in their `hugo.toml`
- Netlify fetches from GitHub at the `go.mod` locked version
- Local testing requires updating module version with `hugo mod get`

### Making Theme Changes

Sites use PR-based workflow: preview builds for testing, production builds at merge.

1. **Edit and test theme files**:
   ```bash
   # Edit in ~/Work/tangerine-theme
   # Commit changes locally

   # Test in consuming sites
   cd ~/Work/shawnyeager-com
   hugo mod get github.com/shawnyeager/tangerine-theme@master
   hugo server -D -p 1313

   cd ~/Work/shawnyeager-notes
   hugo mod get github.com/shawnyeager/tangerine-theme@master
   hugo server -D -p 1316
   ```

2. **Commit and push to master**:
   ```bash
   cd ~/Work/tangerine-theme
   git add -A
   git commit -m "Description of changes"
   git push origin master
   ```

3. **Trigger PR workflows**:
   ```bash
   gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-com
   gh workflow run auto-theme-update-pr.yml --repo shawnyeager/shawnyeager-notes
   ```

4. **Review and merge PRs**:
   - GitHub Actions creates PR in each site
   - Netlify builds FREE deploy preview
   - Review preview URL
   - Merge PR when satisfied
   - Production deploys (15 credits per site)

**Verification:**
```bash
# Check PRs created
gh pr list --repo shawnyeager/shawnyeager-com --label theme-update
gh pr list --repo shawnyeager/shawnyeager-notes --label theme-update

# After merging, verify sites updated
cd ~/Work/shawnyeager-com && git pull && grep tangerine-theme go.mod
cd ~/Work/shawnyeager-notes && git pull && grep tangerine-theme go.mod
```

See `.github/workflows/auto-theme-update-pr.yml` in site repos for implementation details.

## Sites Using This Theme

- [shawnyeager.com](https://shawnyeager.com) - The Gallery (finished work)
- [notes.shawnyeager.com](https://notes.shawnyeager.com) - The Workshop (notes)

## License

MIT License - See LICENSE file for full text.

Copyright (c) 2025 Shawn Yeager
