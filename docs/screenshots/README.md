# Platform Screenshots

This directory contains screenshots showcasing RemitFlow's key features and dashboards.

## Required Screenshots

Please add the following screenshots to this directory:

### 1. `user-dashboard.png`
- **What to capture:** Main user dashboard after login
- **Should show:** 
  - Real-time rate cards from multiple anchors
  - Quick send money widget
  - Recent transaction history
  - Account balance/summary
- **Resolution:** 1920x1080 or higher
- **Tip:** Use testnet data with realistic amounts

### 2. `rate-comparison.png`
- **What to capture:** Rate comparison view when selecting a corridor
- **Should show:**
  - Side-by-side comparison of 2-3 anchors
  - Fee breakdown (fees, FX rate, destination amount)
  - "Best rate" highlighting
  - Total cost comparison
- **Resolution:** 1920x1080 or higher

### 3. `send-money.png`
- **What to capture:** The send money flow (step 2 or 3)
- **Should show:**
  - Amount input field
  - Corridor selection (e.g., USD → COP)
  - Recipient details form
  - Fee breakdown preview
  - Confirm button
- **Resolution:** 1920x1080 or higher

### 4. `anchor-marketplace.png`
- **What to capture:** Anchor marketplace browse view
- **Should show:**
  - Grid/list of available anchors
  - Anchor ratings (stars)
  - Supported corridors
  - Fee estimates
  - Activate/Deactivate toggle buttons
  - Submit new anchor button
- **Resolution:** 1920x1080 or higher

### 5. `transaction-history.png`
- **What to capture:** Transaction history page
- **Should show:**
  - List of past transactions (5-10 items)
  - Status badges (completed, pending, failed)
  - Date, amount, corridor info
  - Filter/search controls
  - Export button
- **Resolution:** 1920x1080 or higher

### 6. `recurring-sends.png`
- **What to capture:** Recurring sends management page
- **Should show:**
  - List of active recurring plans
  - Schedule info (daily/weekly/monthly)
  - Next run date
  - Pause/Resume/Cancel buttons
  - Create new plan button
  - Pending drafts section
- **Resolution:** 1920x1080 or higher

### 7. `admin-metrics.png`
- **What to capture:** Admin metrics dashboard (requires admin role)
- **Should show:**
  - DAU/MAU statistics
  - Transaction volume charts
  - Revenue metrics
  - Retention cohort table
  - Reconciliation status
- **Resolution:** 1920x1080 or higher
- **Tip:** Use seeded demo data for realistic numbers

### 8. `anchor-dashboard.png`
- **What to capture:** Anchor partner dashboard (requires anchor role)
- **Should show:**
  - Transaction volume processed
  - Revenue earned
  - Success rate metrics
  - Corridor performance breakdown
  - Recent transactions
- **Resolution:** 1920x1080 or higher

## Screenshot Guidelines

### Best Practices

1. **Use realistic data** - Avoid placeholder text like "Lorem ipsum" or "$0.00"
2. **Consistent theme** - Use either light mode OR dark mode for all screenshots (recommend light mode)
3. **Clean browser** - Hide browser extensions, bookmarks bar, and unnecessary UI
4. **Proper resolution** - Minimum 1920x1080, ideally 2560x1440 for retina displays
5. **No personal data** - Use test accounts, never real user information
6. **Show key features** - Make sure the main feature is visible without scrolling
7. **Add captions** - Each screenshot should have a descriptive caption in the README

### How to Take Screenshots

#### Option 1: Browser DevTools (Recommended)
1. Open the page in Chrome/Firefox
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "screenshot" and select "Capture full size screenshot"
5. Save to this directory with the correct filename

#### Option 2: Browser Extensions
- **Full Page Screen Capture** (Chrome extension)
- **FireShot** (Firefox/Chrome extension)
- **GoFullPage** (Chrome extension)

#### Option 3: Command Line (Linux)
```bash
# Using gnome-screenshot
gnome-screenshot -f user-dashboard.png

# Using scrot
scrot -s user-dashboard.png  # interactive selection
```

### Image Optimization

Before committing, optimize images to reduce file size:

```bash
# Using pngquant (recommended)
pngquant --quality=65-80 --force *.png

# Using optipng
optipng -o7 *.png

# Using imagemagick
convert *.png -strip -interlace Plane -quality 85%.png
```

**Target file size:** Each screenshot should be <500KB

## File Naming Convention

Use kebab-case for all filenames:
- ✅ `user-dashboard.png`
- ✅ `rate-comparison.png`
- ❌ `user_dashboard.png`
- ❌ `UserDashboard.png`

## Updating Screenshots

When the UI changes significantly:

1. Take new screenshots following the guidelines above
2. Replace the old files (don't create duplicates)
3. Update captions in README.md if needed
4. Commit with message: `docs: update platform screenshots for v0.2.0`

## Need Help?

If you need test data or demo accounts to take screenshots:

```bash
# Seed demo data
cd database
psql -U postgres -d remitflow -f seed_test_data.sql

# Create test admin wallet
cd backend
pnpm run bootstrap:admin -- YOUR_TESTNET_WALLET_ADDRESS
```

---

**Last Updated:** April 2026
