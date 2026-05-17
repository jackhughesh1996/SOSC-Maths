# Standalone Assessment Export

SOSC Maths supports exporting any assessment manifest into a single, portable HTML file. This allows students to take tests offline or in environments where a central server is not available.

## How it works

The export process uses `esbuild` to bundle:
- The React runtime
- MathLive (Interactive Input)
- MathJS (Symbolic Engine)
- The SOSC Maths Assessment Runner
- Your specific test manifest

Everything is inlined into a single `.html` file.

## Usage

From the project root, run:

```bash
npm run build:test-html path/to/your-manifest.json [output-path.html]
```

Example:
```bash
npm run build:test-html src/assessment/demoManifest.ts dist/my-test.html
```

*Note: If your manifest is a `.ts` file, you may need to point to a exported JSON version or modify the script to handle TS imports.*

## Limitations

- **Bundle Size:** Because React and MathLive are bundled, the final HTML file can be 2-3MB.
- **Reporting:** In standalone mode, the "Submit" action typically logs the results to the browser console or offers a JSON download, as there is no backend to receive the data.
- **Fonts:** MathLive may attempt to load fonts from a CDN if they are not available locally.
