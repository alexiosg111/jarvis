# Jarvis Hub

Jarvis Hub is an Electron + React + TypeScript workspace for coordinating multi-agent planning prompts and sending them to Kimi, Z.ai, or Comet. The app keeps a running draft, autosaves to disk, and tracks planning history snapshots.

## Features

- Shared prompt configuration with a multi-agent planning flow
- Electron orchestrator that launches providers with URL length protection
- Autosave + history snapshots stored in the app user data folder
- Copy and export tools for prompts and final plans
- Keyboard shortcuts and responsive layout

## Development

```bash
npm install
npm run dev
```

This starts the Vite renderer on port 5173 and launches the Electron shell.

## Build

```bash
npm run build
```

## Package

```bash
npm run dist:mac
npm run dist:win
```

The `electron-builder.yml` configuration drives packaging. Replace the placeholder icons in `resources/` with your branded `.icns`, `.ico`, and `.png` files.

## Release Automation

Tag a release to trigger the GitHub Actions workflow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow packages macOS and Windows artifacts and publishes a GitHub release.
