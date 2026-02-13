# 📦 Jarvis Hub - Release Artifacts

This folder contains the built release artifacts (installers) for Jarvis Hub.

---

## 📍 Where to Download Installers

The actual installer files are **hosted on GitHub Releases**, not in this repository.

### 🔗 Download Links

**Latest Release:**
- 🌐 https://github.com/alexiosg111/jarvis/releases/latest

**All Releases:**
- 🌐 https://github.com/alexiosg111/jarvis/releases

---

## 📥 Available Installers

### macOS
- **File:** `Jarvis Hub-0.1.2.dmg`
- **Size:** ~80-150 MB
- **Description:** DMG disk image for macOS installation

### Windows
- **File:** `Jarvis Hub-0.1.2-win-x64.exe`
- **Size:** ~100-180 MB
- **Description:** NSIS installer for Windows 64-bit

---

## 🔄 How Installers Are Created

The installers are automatically built by GitHub Actions when a release is tagged:

1. Developer creates a git tag (e.g., `v0.1.2`)
2. GitHub Actions workflow is triggered
3. App is built for macOS and Windows
4. Installers are uploaded to GitHub Releases

---

## 🛠️ For Developers

### Build Locally

If you want to build installers locally:

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Create macOS installer
npm run dist:mac

# Create Windows installer
npm run dist:win
```

The installers will be placed in this `release/` folder.

---

## 📖 Installation Guide

For detailed installation instructions, see:
- 📄 [SETUP.md](../SETUP.md) - Complete user guide for macOS & Windows
- 📄 [README.md](../README.md) - Project overview and quick install

---

## ✅ What You'll Find Here After Building

When you run `npm run dist:mac` or `npm run dist:win`, the following files are created:

### macOS Output
```
release/
├── Jarvis Hub-0.1.2.dmg              # DMG installer (download for users)
├── Jarvis Hub-0.1.2-mac.zip          # Update package (for auto-updates)
├── mac/                              # Build artifacts
│   └── Jarvis Hub.app/
└── ...
```

### Windows Output
```
release/
├── Jarvis Hub-0.1.2-win-x64.exe      # EXE installer (download for users)
├── Jarvis Hub-0.1.2-win-x64.exe.blockmap  # Update package (for auto-updates)
├── win-unpacked/                     # Build artifacts
│   └── Jarvis Hub.exe
└── ...
```

---

**Note:** This folder is typically empty in the repository. The actual installer files are only created during the build process and uploaded to GitHub Releases.
