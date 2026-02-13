# 🚀 Jarvis Hub

**Jarvis Hub** is a modern desktop application for coordinating multi-agent planning prompts and sending them to Kimi, Z.ai, or Comet. The app keeps a running draft, autosaves to disk, and tracks planning history snapshots.

---

## 📦 Quick Install

**For Users - Get Started in 3 Steps:**

1. 📥 [Download the latest release](https://github.com/alexiosg111/jarvis/releases/latest)
2. 📲 Install the `.dmg` (macOS) or `.exe` (Windows) file
3. 🚀 Launch Jarvis Hub and start planning!

👉 **Need detailed installation instructions?** Check out [**SETUP.md**](SETUP.md) for step-by-step guides.

---

## ✨ Features

- **Multi-Agent Planning:** Create and coordinate complex planning workflows
- **Cross-Platform:** Works on macOS and Windows
- **Autosave:** Your work is automatically saved - never lose your progress
- **History Snapshots:** Track all changes with version history
- **Export Tools:** Copy and export prompts and final plans
- **Keyboard Shortcuts:** Efficient workflow with hotkeys
- **Responsive Design:** Clean and intuitive interface

---

## 💻 For Developers

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

This starts:
- Vite renderer on port 5173
- Electron main process
- Hot reload enabled

### Building for Production

```bash
# Build the app
npm run build

# Create installers
npm run dist:mac    # macOS DMG
npm run dist:win    # Windows EXE
```

The `electron-builder.yml` configuration drives packaging. Replace the placeholder icons in `resources/` with your branded `.icns`, `.ico`, and `.png` files.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [**SETUP.md**](SETUP.md) | 🔥 **START HERE** - User installation guide for macOS & Windows |
| [FIX_APPLIED.md](FIX_APPLIED.md) | Release fixes and bug reports |
| [RELEASE_STATUS_REPORT.md](RELEASE_STATUS_REPORT.md) | Release process documentation |

---

## 🔄 Release Automation

The GitHub Actions workflow automatically builds and publishes releases:

```bash
# Tag a release (triggers automated build & release)
git tag v0.1.0
git push origin v0.1.0
```

The workflow packages macOS and Windows artifacts and publishes a GitHub release.

---

## 🌟 Latest Release

**Version:** 0.2.0
**Release Date:** February 2026

### Download Links
- 🍎 [macOS DMG](https://github.com/alexiosg111/jarvis/releases/tag/v0.2.0)
- 🪟 [Windows EXE](https://github.com/alexiosg111/jarvis/releases/tag/v0.2.0)

See [Releases](https://github.com/alexiosg111/jarvis/releases) for all versions.

---

## 🆘 Support

- 🐛 **Report Issues:** [GitHub Issues](https://github.com/alexiosg111/jarvis/issues)
- 💡 **Feature Requests:** [GitHub Issues](https://github.com/alexiosg111/jarvis/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/alexiosg111/jarvis/discussions)

---

## 📄 License

[Specify your license here]

---

**Made with ❤️ using Electron, React, and TypeScript**
