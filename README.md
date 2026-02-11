# jarvis-hub

A multi-agent planning flow application built with Electron, React, and TypeScript. This app provides a unified interface for managing tasks and plans across multiple AI agents (Kimi, z.ai, Comet), with features like autosave, history management, and export functionality.

## Features

- **Multi-Agent Support**: Open tasks and plans in Kimi, z.ai, or Comet browsers
- **Task Management**: Create, edit, and track tasks with autosave
- **Plan Comparison**: Compare plans from different AI agents side by side
- **History**: Browse and reload previous tasks
- **Export**: Export individual plans or all plans as formatted text
- **Copy to Clipboard**: Quick copy functionality for plans
- **Keyboard Shortcuts**: Efficient workflow with Ctrl/Cmd+Enter, Ctrl/Cmd+E, Ctrl/Cmd+N
- **IPC Validation**: Secure communication between main and renderer processes
- **Responsive Design**: Works on desktop and tablet sizes
- **Error Handling**: User-friendly toast notifications

## Requirements

- Node.js 20 or higher
- npm, yarn, or pnpm
- macOS (x64/arm64) or Windows (x64) for building distributables

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jarvis-hub
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the application in development mode:
```bash
npm run dev
```

This will:
- Start the Vite dev server on port 5173
- Launch the Electron app with hot reload
- Open DevTools automatically

## Building

Build the application for production:
```bash
npm run build
```

This compiles TypeScript and bundles the React application into the `dist/` directory.

## Creating Distributables

### macOS
```bash
npm run dist:mac
```

This creates a DMG installer in the `release/` directory.

### Windows
```bash
npm run dist:win
```

This creates an NSIS installer in the `release/` directory.

## Usage

### Setting a Task
1. Enter your task description in the text area
2. Click "Set Task" or press `Ctrl+Enter` (or `Cmd+Enter` on macOS)
3. The task is saved to history automatically

### Working with Plans
1. After setting a task, you can manually add plans from AI agents
2. Each plan card shows:
   - The agent that generated it
   - The plan content
   - Timestamp
3. Use action buttons to:
   - Open the plan in the agent's browser
   - Copy the plan to clipboard
   - Export the plan as formatted text

### Opening in Agent Browsers
1. Click "Open [Agent Name]" on a plan card
2. Or use the "Quick Actions" panel to open the first plan in any agent
3. The app validates inputs and constructs URLs with task and plan context

### History Management
1. Previous tasks are saved automatically
2. Click any task in the history panel to reload it
3. Associated plans are also restored

### Exporting
- **Individual Plan**: Click "Export" on a plan card
- **All Plans**: Click "Export All Plans" or press `Ctrl+E`
- Exported format includes task description, plan content, agent name, and timestamp

### Keyboard Shortcuts
- `Ctrl+Enter` / `Cmd+Enter`: Set current task
- `Ctrl+E` / `Cmd+E`: Export all plans
- `Ctrl+N` / `Cmd+N`: Clear current task

## Project Structure

```
jarvis-hub/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Entry point, window creation, IPC handlers
│   │   ├── preload.ts  # Context bridge for secure IPC
│   │   ├── orchestrator.ts  # Agent browser orchestration
│   │   └── isDev.ts    # Development environment detection
│   ├── renderer/       # React UI
│   │   ├── App.tsx     # Main application component
│   │   ├── main.tsx    # React entry point
│   │   ├── index.html  # HTML template
│   │   └── styles.css  # Application styles
│   └── shared/         # Shared code
│       └── config.ts   # Agent configs, prompt builders, validation
├── resources/          # App icons
│   ├── icon.icns       # macOS icon (placeholder)
│   └── icon.ico        # Windows icon (placeholder)
├── .github/
│   └── workflows/
│       └── release.yml # GitHub Actions release workflow
├── package.json
├── tsconfig.json       # Root TypeScript config
├── tsconfig.main.json  # Main process config
├── tsconfig.renderer.json # Renderer config
├── vite.renderer.config.ts # Vite config for renderer
└── electron-builder.yml # Build configuration
```

## Security

- **Context Isolation**: Enabled to prevent renderer access to Node.js APIs
- **No Node Integration**: Disabled in renderer for security
- **IPC Validation**: All IPC inputs are validated before processing
- **URL Length Limits**: Prompt URLs are capped at 2000 characters

## Release Automation

### Creating a Release

1. Update version in `package.json`
2. Commit and tag the release:
```bash
git commit -m "chore: bump version to X.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

3. GitHub Actions will automatically:
   - Build the application
   - Create platform-specific installers
   - Generate a GitHub release with assets attached

### Release Artifacts

- **macOS**: DMG installer (universal for x64/arm64)
- **Windows**: NSIS installer (x64)

## Troubleshooting

### Build Fails
- Ensure Node.js 20+ is installed
- Delete `node_modules` and `dist/`, then run `npm install` again

### Icons Missing
- Place `icon.icns` (1024x1024) in `resources/` for macOS
- Place `icon.ico` (256x256) in `resources/` for Windows
- Default Electron icons will be used if placeholders are missing

### Development Server Not Starting
- Check if port 5173 is already in use
- Kill the process or change the port in `vite.renderer.config.ts`

### IPC Errors
- Check DevTools console for detailed error messages
- Ensure preload script is built correctly
- Verify `contextIsolation: true` in main window config

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code passes linting and type checking:
```bash
npm run lint
npm run typecheck
```
5. Submit a pull request

## License

MIT

## Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [electron-builder](https://www.electron.build/)
