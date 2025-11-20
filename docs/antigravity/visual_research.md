# Visual Research Report: Palantir Ecosystem (Nov 2025)

## 1. Core Aesthetic ("Odin" Design System)
- **Theme**: Deep Space Dark Mode. Backgrounds are not just black (`#000000`), but rich, deep blues and grays (`#0B0C0E`, `#111418`).
- **Typography**: Monospace fonts (JetBrains Mono, Roboto Mono) for data and technical labels. Clean sans-serif (Inter, Blueprint) for UI text. High contrast for readability.
- **Accents**: "Palantir Blue" (`#3B82F6`) is the primary action color. Semantic colors (Red/Green/Amber) are used sparingly for status.
- **Density**: Ultra-high density. Interfaces are packed with information. "Cockpit" feel. Collapsible sidebars, docking panels, and multi-pane layouts.

## 2. Product-Specific Patterns

### Foundry (The Operating System)
- **Ontology Graph**: Nodes are circular with icons. Edges are thin, subtle lines. Force-directed layout.
- **Object Explorer**: Data grids are central. "Spreadsheet-like" but with rich cell renderers (sparklines, tags).
- **Pipeline Builder**: Left-to-right flow. Nodes are rectangular cards with input/output ports.

### AIP (The Intelligence Layer)
- **AIP Terminal**: Not a simple chat bubble. It's a command center.
    - **Input**: Large, multi-line text area with "slash command" support.
    - **Output**: Structured. It doesn't just output text; it outputs *widgets* (tables, maps, graphs).
    - **Context**: Sidebar showing "Active Context" (what objects/files the AI is looking at).

### Gotham (The Command Center)
- **Map First**: The map is the background. Dark mode map tiles.
- **Overlays**: Data layers float over the map.
- **Timeline**: Bottom scrubber for temporal analysis.

## 3. Re-Architecture Implications
To achieve this "Real Product" feel, we cannot use standard UI libraries. We need:
- **Custom Docking Layout System**: Like VS Code or Golden Layout.
- **Canvas-based Rendering**: For Graphs and Maps (HTML DOM is too slow for 10k+ nodes).
- **Virtualization**: For Data Grids (handling millions of rows).
