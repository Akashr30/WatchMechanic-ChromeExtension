# ⏰ WatchMechanic - TimeZone Converter

A Chrome extension that converts Unix timestamps to multiple timezones instantly. Double-click any timestamp on any webpage to see it converted — no more copy-pasting into online converters.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/YOUR_EXTENSION_ID)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### Double-Click Conversion
Double-click any number on any webpage — a tooltip instantly shows that timestamp in multiple timezones. Works on every website.

### Popup Converter
Click the extension icon to:
- View current time across all your selected timezones
- Copy current Unix timestamp (ms or sec) with one click
- Paste any timestamp and convert it
- Convert a specific date/time between timezones

### Right-Click Menu
Select a timestamp → right-click → **"Convert timestamp to timezones"**

### Settings & Customization
- **10 built-in timezones**: IST, GMT, PST, EST, CST, JST, AEST, CST (China), CET, SAST
- **Add custom timezones**: Any IANA timezone (Europe/Berlin, America/Denver, etc.)
- **Set your primary timezone**: Always appears first
- **Sec/Ms toggle**: Choose whether numbers are treated as seconds or milliseconds
- **11 date formats**: ISO, US, EU, compact, readable, date-only, time-only, and more
- **Enable/disable double-click**: Turn off page-level detection if not needed
- **Auto-save settings**: Every change saves instantly

### Smart Features
- **Negative timestamps**: Supports pre-1970 dates (e.g., `-86400000`)
- **DST-aware**: Automatically handles daylight saving time transitions
- **Smart tooltip positioning**: Stays within viewport even at page edges or zoomed browsers
- **One-click copy**: Click any time card to copy in your preferred format

---

## 🚀 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store listing](https://chromewebstore.google.com/detail/watchmechanic-timezone-co/cgacpbccgfljlhmbedojdiklabiilflo)
2. Click **"Add to Chrome"**

### From Source (Developer)
1. Clone this repo:
   ```bash
   git clone https://github.com/Akashr30/WatchMechanic-ChromeExtension.git
   ```
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right)
4. Click **"Load unpacked"** → select the cloned folder
5. The extension icon appears in your toolbar

---

## 🎯 Usage

| Action | How |
|---|---|
| **Convert on any page** | Double-click a number |
| **Manual convert** | Click extension icon → paste timestamp |
| **Right-click convert** | Select text → right-click → "Convert timestamp to timezones" |
| **Copy a time** | Click any timezone card in popup or tooltip |
| **Change settings** | Right-click extension icon → Options |

---

## 🛡️ Privacy

- **No data collection** — zero analytics, zero tracking
- **No external requests** — everything runs locally in your browser
- **No accounts** — no login, no signup
- Settings stored via `chrome.storage.sync` (syncs across your Chrome devices only)

[Full Privacy Policy](https://akashr30.github.io/WatchMechanic-ChromeExtension/privacy-policy.html)

---

## 🧪 Testing

The extension has **481 tests** covering all conversion logic:

```bash
npm install
npx jest
```

Test coverage includes: timezone conversions, DST handling, all 11 date formats × 10 timezones, negative timestamps, boundary cases, tooltip positioning, and settings validation.

---

## 🛠️ Tech Stack

- **Manifest V3** — latest Chrome extension standard
- **Vanilla JS** — no frameworks, no dependencies
- **Intl.DateTimeFormat** — IANA timezone database for accurate conversions
- **Jest** — test framework

---

## 📁 Project Structure

```
├── manifest.json         # Extension manifest (MV3)
├── popup.html / popup.js # Extension popup UI
├── content.js            # Double-click detection & tooltip on webpages
├── content.css           # Tooltip styles
├── background.js         # Right-click context menu
├── settings.html / .js   # Settings page (auto-save)
├── timezone-utils.js     # Core conversion utilities
├── privacy-policy.html   # Privacy policy
└── icons/                # Extension icons (16/32/48/128)
```

---

## 🤝 Contributing

Found a bug or want a new timezone/feature? [Open an issue](https://github.com/Akashr30/WatchMechanic-ChromeExtension/issues).

---

## 📄 License

[MIT](LICENSE)
