# Plausible Analytics Goal Setup Guide

## Overview

You now have **11 total goals** across both sites:

- **shawnyeager.com:** 9 goals
- **notes.shawnyeager.com:** 2 goals

All event tracking is configured via code - you just need to create the goals in the Plausible UI.

---

## shawnyeager.com Goals (9 total)

### Tier 1: Conversion Goals (High Priority)

**Goal 1: Calendar Booking**

- **Type:** Custom Event
- **Event Name:** `Calendar Booking`
- **Display Name:** Calendar Booking
- **Purpose:** Track clicks to cal.com/shawnyeager

**Goal 2: Email Contact**

- **Type:** Custom Event
- **Event Name:** `Email Contact`
- **Display Name:** Email Contact
- **Purpose:** Track mailto: link clicks (footer, /connect, /media pages)

**Goal 3: Signal Contact**

- **Type:** Custom Event
- **Event Name:** `Signal Contact`
- **Display Name:** Signal Contact
- **Purpose:** Track Signal link clicks (/connect, /media pages)

**Goal 4: Newsletter Signup** ✅ Already created

- **Type:** Custom Event
- **Event Name:** `Form Submission`
- **Display Name:** Newsletter Signup
- **Purpose:** Track newsletter form submissions (already tracking)

### Tier 2: Engagement Goals (Medium Priority)

**Goal 5: Podcast Subscribe**

- **Type:** Custom Event
- **Event Name:** `Podcast Subscribe`
- **Display Name:** Podcast Subscribe
- **Purpose:** Track clicks to all podcast platforms (Fountain, Apple, Spotify, YouTube, Substack, Pocket Casts)

**Goal 6: Essay CTA**

- **Type:** Custom Event
- **Event Name:** `Essay CTA`
- **Display Name:** Essay CTA Clicks
- **Purpose:** Track "Read more" clicks from homepage featured/latest essay

**Goal 7: Media Kit Download**

- **Type:** Custom Event
- **Event Name:** `Media Kit Download`
- **Display Name:** Media Kit Download
- **Purpose:** Track headshot download clicks from /media page

**Goal 8: vCard Download**

- **Type:** Custom Event
- **Event Name:** `vCard Download`
- **Display Name:** vCard Download
- **Purpose:** Track contact card download from /connect page

### Tier 3: Navigation Goals (Nice to Have)

**Goal 9: All Essays Navigation**

- **Type:** Custom Event
- **Event Name:** `All Essays`
- **Display Name:** All Essays Navigation
- **Purpose:** Track clicks to /essays/ listing from homepage

**Goal 10: Podcast External Link**

- **Type:** Custom Event
- **Event Name:** `Podcast External`
- **Display Name:** Podcast External Link
- **Purpose:** Track clicks to trustrevolution.co from homepage and /media page

**Goal 11: Cross-Site Navigation (.com → .notes)**

- **Type:** Custom Event
- **Event Name:** `Cross-Site Navigation`
- **Display Name:** Cross-Site Navigation
- **Purpose:** Track footer clicks from .com to notes.shawnyeager.com

---

## notes.shawnyeager.com Goals (2 total)

**Goal 1: Email Contact**

- **Type:** Custom Event
- **Event Name:** `Email Contact`
- **Display Name:** Email Contact
- **Purpose:** Track mailto: link clicks from footer

**Goal 2: Cross-Site Navigation (.notes → .com)**

- **Type:** Custom Event
- **Event Name:** `Cross-Site Navigation`
- **Display Name:** Cross-Site Navigation
- **Purpose:** Track footer clicks from notes to shawnyeager.com

---

## Step-by-Step: Creating Goals in Plausible UI

### For shawnyeager.com

1. **Log in to Plausible:** https://plausible.io
2. **Navigate to shawnyeager.com settings:**
   - Click on "shawnyeager.com" in your sites list
   - Click "Settings" (gear icon)
   - Click "Goals" in the left sidebar

3. **Create each goal** (repeat for all 9 goals):
   - Click "Add Goal" button
   - Select "Custom Event"
   - Enter the **Event Name** exactly as shown above (case-sensitive, use + for spaces)
   - Click "Add Goal"

**Important:** Event names must match exactly, including the `+` character for spaces (e.g., `Email+Contact`, not `Email Contact`).

### For notes.shawnyeager.com

1. **Navigate to notes.shawnyeager.com settings:**
   - Click on "notes.shawnyeager.com" in your sites list
   - Click "Settings" (gear icon)
   - Click "Goals" in the left sidebar

2. **Create both goals:**
   - `Email Contact`
   - `Cross-Site Navigation`

---

## Verification Checklist

After creating goals, verify they're working:

### shawnyeager.com

**Test Conversion Goals:**

- [ ] Visit /connect → Click "Email" → Check Plausible for "Email Contact" event
- [ ] Visit /connect → Click "Signal" → Check Plausible for "Signal Contact" event
- [ ] Visit /connect → Click "Calendar" → Check Plausible for "Calendar Booking" event
- [ ] Visit /connect → Click "Download contact card" → Check for "vCard Download" event

**Test Engagement Goals:**

- [ ] Visit /podcast → Click any platform link → Check for "Podcast Subscribe" event
- [ ] Visit homepage → Click "Read more" on featured essay → Check for "Essay CTA" event
- [ ] Visit /media → Click headshot download → Check for "Media Kit Download" event

**Test Navigation Goals:**

- [ ] Visit homepage → Click "All essays" → Check for "All Essays" event
- [ ] Visit homepage → Click "Listen now" (podcast) → Check for "Podcast External" event
- [ ] Visit any page → Click "Notes →" in footer → Check for "Cross-Site Navigation" event

### notes.shawnyeager.com

- [ ] Visit any page → Click "Email" in footer → Check for "Email Contact" event
- [ ] Visit any page → Click "Essays →" in footer → Check for "Cross-Site Navigation" event

---

## Browser Testing Method

**Option 1: Use Browser DevTools**

1. Open DevTools (F12)
2. Go to "Network" tab
3. Filter for "plausible" or "api/event"
4. Click a tracked link
5. Look for POST request to Plausible API with your event name

**Option 2: Use Plausible Live View**

1. Go to Plausible dashboard
2. Click "Live" tab (top right)
3. Click tracked links on your site
4. Watch for events appearing in real-time

**Note:** Goals won't appear in the dashboard until they receive their first conversion event.

---

## Configuration Reference

All event names are configured in `hugo.toml`:

**shawnyeager-com/hugo.toml:**

```toml
[params.plausible_events]
  contact_email = "Email+Contact"
  contact_signal = "Signal+Contact"
  contact_calendar = "Calendar+Booking"
  contact_vcard = "vCard+Download"
  podcast_subscribe = "Podcast+Subscribe"
  podcast_external = "Podcast+External"
  essay_cta = "Essay+CTA"
  all_essays = "All+Essays"
  media_kit = "Media+Kit+Download"
  cross_site_nav = "Cross-Site+Navigation"
```

**shawnyeager-notes/hugo.toml:**

```toml
[params.plausible_events]
  contact_email = "Email+Contact"
  cross_site_nav = "Cross-Site+Navigation"
```

**To change an event name:** Update hugo.toml, rebuild, and update the goal name in Plausible UI to match.

---

## Architecture Overview

### Semantic Components

The theme now provides semantic shortcodes that automatically include tracking:

**contact-method shortcode:**

```markdown
{{< contact-method type="email" value="hello@example.com" >}}
{{< contact-method type="signal" value="https://signal.me/..." display="Custom display" >}}
{{< contact-method type="calendar" value="https://cal.com/..." display="Book a meeting" >}}
```

**Enhanced shortcodes with optional event parameter:**

```markdown
{{< button url="/file.pdf" text="Download" variant="download" event="vCard+Download" >}}
{{< link url="https://example.com" text="Visit" style="cta" event="Podcast+External" >}}
```

### Config-Driven Footer Tracking

Footer links automatically use `plausible_events` config:

- Email link → `contact_email` event
- Cross-site navigation → `cross_site_nav` event

### Homepage Template Tracking

Homepage CTAs use config from `hugo.toml`:

- Essay "Read more" → `essay_cta` event
- "All essays" link → `all_essays` event
- Podcast "Listen now" → `podcast_external` event
- Podcast "Subscribe" → `podcast_subscribe` event

---

## Troubleshooting

**Events not firing?**

- Check browser console for errors
- Verify Plausible script is loaded (check Network tab)
- Verify event name in code matches Plausible goal exactly
- Try incognito/private mode (extensions can block analytics)

**Goals not appearing in dashboard?**

- Goals only appear after receiving first conversion
- Check "Live" view to verify events are being sent
- Allow up to 5-10 minutes for data to populate

**Want to disable tracking temporarily?**

- Remove specific event entries from `hugo.toml`
- Events will still work but won't have tracking classes added

**Need to change an event name?**

1. Update `hugo.toml` in the site repo
2. Commit and push changes
3. Update the goal name in Plausible UI to match
4. Or delete old goal and create new one with new name

---

## Summary

**What's tracking automatically:**

✅ Footer email links (both sites)
✅ Footer cross-site navigation (both sites)
✅ Newsletter signup (.com only - already existed)

**What uses semantic shortcodes:**

✅ Contact methods on /connect and /media pages
✅ Download buttons with event tracking
✅ External links with event tracking

**What's in templates:**

✅ Homepage essay CTAs
✅ Homepage podcast links
✅ Homepage "All essays" navigation

**Total events to create in Plausible UI:** 11 unique event names (some shared across sites)
