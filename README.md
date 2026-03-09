# JSON Builder — Visual JSON Editor & Exporter

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/art70x/json-builder/blob/main/LICENSE)

> Build, edit, and export JSON objects visually with typed properties, nested support, live preview, and drag-to-reorder—all in your browser.

🌐 **Try it live:** [https://json-b.vercel.app](https://json-b.vercel.app)

---

## 🚀 Key Features

**Core Features**

* **Typed Property Editor**: Add properties as `string`, `number`, `boolean`, or `array`. Booleans toggle true/false; arrays auto-detect element types.
* **Nested JSON Support**: Easily create objects within objects or arrays within arrays.
* **Live Preview**: Syntax-highlighted, line-numbered JSON with compact or pretty-print toggle.
* **Drag-to-Reorder**: Rearrange objects and arrays visually using drag handles.
* **Import & Export**: Upload JSON files and export timestamped JSON with all values coerced to their types.
* **Save & Load Datasets**: Store named datasets locally using IndexedDB—no server required.

**Advanced Features**

* **Privacy-First**: 100% client-side; your JSON never leaves your browser.
* **Keyboard Shortcuts**: Quick actions for export, save, and import.
* **Responsive UI**: Side-by-side editor + preview on desktop, tab-based layout on mobile.
* **PWA Support**: Installable and works offline.

---

## 🛠️ Technology Stack

* **Framework**: React 19 + TypeScript
* **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI primitives)
* **Icons**: Lucide React
* **Async State**: TanStack Query v5
* **Local Persistence**: IndexedDB via `idb`
* **Build Tool**: Vite 8
* **Code Quality**: ESLint + Prettier

---

## ⚡ Quick Start

### Prerequisites

* Node.js 20+
* pnpm 7+ (install with `npm i -g pnpm` if needed)

### Installation

```bash
# Clone the repository
git clone https://github.com/art70x/json-builder.git

# Navigate to the project folder
cd json-builder

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will run at: [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build production version
pnpm build

# Preview production build
pnpm preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut         | Action               |
| ---------------- | -------------------- |
| `Ctrl / Cmd + E` | Export JSON to file  |
| `Ctrl / Cmd + S` | Save current dataset |
| `Ctrl / Cmd + I` | Import a JSON file   |

---

## 🤝 Contributing

We welcome contributions! Open issues, suggest features, or submit pull requests. See [CONTRIBUTING.md](https://github.com/art70x/json-builder/blob/main/CONTRIBUTING.md) for detailed guidelines.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) – Accessible and customizable Vue component library.
- [idb](https://github.com/jakearchibald/idb) – Lightweight promise-based IndexedDB wrapper used for client-side dataset persistence.
- [TanStack Query](https://tanstack.com/query) – Manages async state and cache invalidation for the local dataset layer.
- [Lucide React](https://lucide.dev/) – Consistent, lightweight icon set used throughout the interface.
- [Vuetrix](https://github.com/art70x/Vuetrix) – Inspired the project's architecture, CI workflow, formatting standards, and Vite configuration.
- [Caffeine](https://caffeine.ai/) – Used to build the first version of the app.

---

<p align="center">
  Made with ❤️ for the web development community
</p>
