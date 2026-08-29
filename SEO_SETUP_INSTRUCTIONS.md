# ESL FDA AI Device Intelligence - SEO Setup Instructions

**Site URL:** https://esl-fda.io
**GitHub:** https://github.com/zuwasi/esl-fda-ai-devices
**Hosting:** Railway (Pro account)
**Prepared:** August 29, 2026

---

## Overview

The website is live at **https://esl-fda.io** with full SEO infrastructure already in place:

- Sitemap: https://esl-fda.io/sitemap.xml (1,248 device pages + 5 static pages)
- Robots.txt: https://esl-fda.io/robots.txt
- Per-page metadata (title, description, canonical URLs) on all pages
- OpenGraph and Twitter Card tags on all pages
- JSON-LD structured data (schema.org MedicalDevice) on every device detail page
- PWA manifest: https://esl-fda.io/manifest.webmanifest

**Your job:** Register the site with Google and Bing search consoles, verify ownership, submit the sitemap, and request initial indexing. No code changes are required - everything below is done through web dashboards.

**Estimated time:** 30-45 minutes total

---

## Prerequisites

- A Google account (Gmail or Google Workspace)
- A Microsoft account (Outlook, Hotmail, or Microsoft 365) - or you can sign into Bing Webmaster Tools with your Google account
- Access to the Railway dashboard where esl-fda.io is managed (for DNS verification)
  - URL: https://railway.com/workspace/domains
  - You need to be a workspace admin to add DNS records

---

## Step 1: Google Search Console (highest priority)

### 1.1 Add the property

1. Go to https://search.google.com/search-console
2. Sign in with your Google account
3. Click **Add property** (top-left dropdown or the button)
4. Select **URL prefix** (not Domain - URL prefix is easier to verify)
5. Enter: https://esl-fda.io
6. Click **Continue**

### 1.2 Verify ownership

Google will show multiple verification methods. Use one of these:

**Option A - HTML tag method (recommended, easiest):**

1. Google will display an HTML meta tag with a content attribute
2. Copy the content value only (the long string inside the quotes)
3. Send this string to the developer (Daniel) who will add it to the site head section in src/app/layout.tsx
4. Wait for the next deployment (automatic on git push, ~40 seconds)
5. Come back to Google Search Console and click **Verify**

**Option B - DNS TXT record method (if you have Railway DNS access):**

1. Choose the TXT record method
2. Google gives you a value like: google-site-verification=ABCDEF...
3. Go to Railway: https://railway.com/workspace/domains
4. Open esl-fda.io
5. In the DNS Records section, click Add Record
6. Type: TXT, Name: @ (or leave blank), Value: paste the Google verification string
7. Save
8. Go back to Google Search Console and click Verify
9. Note: DNS propagation may take 5-30 minutes. If verification fails, wait and try again.

### 1.3 Submit the sitemap

1. In Google Search Console, select the https://esl-fda.io property
2. In the left sidebar, click **Sitemaps**
3. In the Add a new sitemap field, enter: sitemap.xml
4. Click **Submit**
5. The status should change to Success within a few minutes
6. You should see approximately 1,253 URLs discovered (1,248 device pages + 5 static pages)

### 1.4 Request indexing for key pages

1. In the top search bar of Search Console, paste: https://esl-fda.io
2. Click Enter or the search icon
3. If it says URL is not on Google, click Request Indexing
4. Repeat for these important pages:
   - https://esl-fda.io/search
   - https://esl-fda.io/about
   - https://esl-fda.io/case-studies
   - https://esl-fda.io/assessment
   - https://esl-fda.io/device/K240369 (a sample device page)

Note: Google limits indexing requests to approximately 10 per day. Prioritize the homepage and main pages above.

### 1.5 Check coverage (after 24-48 hours)

1. Come back the next day
2. Left sidebar -> Pages (under Indexing)
3. You should see pages moving from Not indexed to Indexed
4. Full indexing of all 1,248 device pages typically takes 2-4 weeks

---

## Step 2: Bing Webmaster Tools

### 2.1 Add the site

1. Go to https://www.bing.com/webmasters
2. Sign in with your Microsoft account OR click Sign in with Google
3. Click Add a site (or the + icon)
4. Enter: https://esl-fda.io
5. Click ADD

### 2.2 Verify ownership

Bing offers the same verification methods as Google.

**Option A - HTML tag method:**

1. Bing gives you a meta tag to add to the site head section
2. Send the tag content to the developer (Daniel) to add to src/app/layout.tsx
3. Wait for deployment (~40 seconds after push)
4. Come back to Bing and click Verify

**Option B - DNS TXT record:**

1. Same process as Google - add a TXT record in Railway DNS panel
2. Bing provides its own verification string (different from Googles)
3. Add it as a second TXT record alongside Googles if you used that method
4. Click Verify

### 2.3 Submit the sitemap

1. In Bing Webmaster Tools, select your site
2. Left sidebar -> Sitemaps
3. Enter: https://esl-fda.io/sitemap.xml
4. Click Submit
5. Bing will show the URL count and start crawling

### 2.4 Submit key URLs (optional)

1. Left sidebar -> URL Submission
2. Submit the same key URLs listed in step 1.4
3. Bing allows up to 10,000 URLs per day via the URL Submission API, but manual submission is limited to ~10 per day

---

## Step 3: Google Analytics (optional, recommended)

This step requires a code change, so coordinate with the developer.

### 3.1 Create a GA4 property

1. Go to https://analytics.google.com
2. Sign in with your Google account
3. Click Admin (gear icon, bottom left)
4. Click Create Property
5. Property name: ESL FDA AI Device Intelligence
6. Time zone: your timezone
7. Currency: USD (or your preference)
8. Platform: Web
9. Website URL: https://esl-fda.io
10. Stream name: ESL FDA AI
11. Click Create stream
12. Copy the Measurement ID (format: G-XXXXXXXXXX)

### 3.2 Send the Measurement ID to the developer

Send the G-XXXXXXXXXX ID to Daniel. He will add the Google Analytics script to src/app/layout.tsx and push the update. Tracking will start within 24 hours.

### 3.3 Set up key events (after GA4 is collecting data, 24+ hours later)

1. In GA4, go to Admin -> Events
2. Mark these as conversions (toggle Mark as conversion):
   - page_view (automatic)
   - Any custom events the developer sets up for search, device detail views, and contact clicks

---

## Step 4: Verify everything works (after deployment completes)

### 4.1 Sitemap test

1. Open this URL in your browser: https://esl-fda.io/sitemap.xml
2. You should see an XML file listing URLs starting with https://esl-fda.io/
3. Count: should be approximately 1,253 entries

### 4.2 Robots.txt test

1. Open: https://esl-fda.io/robots.txt
2. You should see:
   User-agent: *
   Allow: /
   Sitemap: https://esl-fda.io/sitemap.xml

### 4.3 OpenGraph / social share preview

1. Go to https://www.opengraph.xyz/
2. Paste: https://esl-fda.io
3. You should see a preview card with:
   - Title: ESL FDA AI Device Intelligence
   - Description starting with The only free public platform...
   - Icon image
4. Also test a device page: https://esl-fda.io/device/K240369
5. You should see the device name and company in the preview

### 4.4 Google Rich Results test

1. Go to https://search.google.com/test/rich-results
2. Paste: https://esl-fda.io/device/K240369
3. You should see Detected structured data with MedicalDevice schema
4. If it shows no structured data, the page may not have been crawled yet - wait for indexing

### 4.5 Google PageSpeed test

1. Go to https://pagespeed.web.dev/
2. Enter: https://esl-fda.io
3. Review the Core Web Vitals scores
4. Share the results with the developer if any issues are flagged

---

## Step 5: Optional search engines (low priority)

### Yandex

1. Go to https://webmaster.yandex.com
2. Add site: https://esl-fda.io
3. Verify via HTML tag or DNS TXT
4. Submit sitemap: https://esl-fda.io/sitemap.xml

### DuckDuckGo

No submission needed. DuckDuckGo crawls the web independently and will find the site through sitemaps and links.

### Brave Search

No submission needed. Brave crawls independently. The site will appear automatically.

---

## What NOT to do

- Do NOT change any DNS records other than adding the verification TXT records described above
- Do NOT modify the Railway service configuration (environment variables, networking, etc.)
- Do NOT request indexing for more than 10 URLs per day (Google limits this)
- Do NOT submit the sitemap multiple times - once is enough; Google will re-crawl it periodically
- Do NOT use the Google URL Inspection tool on more than a few URLs per hour

---

## Summary checklist

| Step | Task | Done? |
|------|------|-------|
| 1.1 | Add property in Google Search Console | [ ] |
| 1.2 | Verify ownership (HTML tag or DNS TXT) | [ ] |
| 1.3 | Submit sitemap to Google | [ ] |
| 1.4 | Request indexing for key pages | [ ] |
| 2.1 | Add site in Bing Webmaster Tools | [ ] |
| 2.2 | Verify ownership in Bing | [ ] |
| 2.3 | Submit sitemap to Bing | [ ] |
| 3.1 | Create GA4 property (optional) | [ ] |
| 3.2 | Send Measurement ID to developer | [ ] |
| 4.1 | Verify sitemap.xml loads | [ ] |
| 4.2 | Verify robots.txt loads | [ ] |
| 4.3 | Test OpenGraph preview | [ ] |
| 4.4 | Test Rich Results | [ ] |
| 4.5 | Run PageSpeed test | [ ] |

---

## Questions?

If anything is unclear or if verification fails, contact Daniel (developer) who has access to the Railway DNS panel, GitHub repository, and can make code changes as needed.

**Key URLs:**
- Live site: https://esl-fda.io
- GitHub: https://github.com/zuwasi/esl-fda-ai-devices
- Railway dashboard: https://railway.com
- ESL main site: https://eswlab.com
- ESL contact: https://eswlab.com/contact-us/
