import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { execSync } from 'child_process';

/**
 * Portable HTML Escape Utility
 */
function escapeManifest(manifest: any): string {
  const json = JSON.stringify(manifest);
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

async function build() {
  const args = process.argv.slice(2);
  const manifestPath = args[0];
  const outputPath = args[1] || 'dist/standalone-test.html';

  if (!manifestPath) {
    console.error('Usage: tsx scripts/buildStandaloneTest.ts <path-to-manifest.json> [output-path]');
    process.exit(1);
  }

  try {
    // 1. Load and validate manifest
    const manifestRaw = fs.readFileSync(path.resolve(manifestPath), 'utf-8');
    const manifest = JSON.parse(manifestRaw);
    
    console.log(`Building standalone test: ${manifest.title || 'Untitled'}`);

    // 2. Generate CSS using Tailwind CLI
    console.log('Generating Tailwind CSS...');
    const tempCssPath = path.resolve('dist/temp-standalone.css');
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Try to run tailwind CLI - we use npx to ensure it's available
    try {
      execSync(`npx @tailwindcss/cli -i src/index.css -o ${tempCssPath} --minify`, { stdio: 'inherit' });
    } catch (err) {
      console.warn('Tailwind CLI failed, attempting fallback or continuing without full styles.');
    }

    const bundleCss = fs.existsSync(tempCssPath) ? fs.readFileSync(tempCssPath, 'utf-8') : '';

    // 3. Bundle the application code
    console.log('Starting esbuild bundle...');
    const result = await esbuild.build({
      entryPoints: [path.resolve('src/assessment/export/standalone-entry.ts')],
      bundle: true,
      minify: true,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      write: false,
      outfile: 'bundle.js',
      metafile: true,
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.css': 'css',
        '.png': 'dataurl',
        '.svg': 'dataurl'
      }
    });

    const bundleJs = result.outputFiles.find(f => f.path.endsWith('.js'))?.text || '';

    // 4. Load Template
    let template = fs.readFileSync('src/assessment/export/standalone-template.html', 'utf-8');

    // 5. Inject
    template = template.replace('/* INJECTED_MANIFEST */', escapeManifest(manifest));
    template = template.replace('/* INJECTED_BUNDLE */', bundleJs);
    template = template.replace('/* INJECTED_CSS */', bundleCss);

    // 6. Write output
    fs.writeFileSync(outputPath, template);

    // Clean up
    if (fs.existsSync(tempCssPath)) fs.unlinkSync(tempCssPath);

    console.log(`Successfully exported standalone test to: ${outputPath}`);
    console.log(`Total HTML size: ${(template.length / 1024 / 1024).toFixed(2)} MB`);

  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();
