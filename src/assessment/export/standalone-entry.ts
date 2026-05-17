import React from 'react';
import { createRoot } from 'react-dom/client';
import { StandaloneTestRunner } from '../runner/StandaloneTestRunner';
import { DynamicTestManifest } from '../schema/DynamicTestTypes';

declare global {
  interface Window {
    TEST_MANIFEST: DynamicTestManifest;
  }
}

const container = document.getElementById('app');
if (container && window.TEST_MANIFEST) {
  const root = createRoot(container);
  root.render(
    React.createElement(StandaloneTestRunner, {
      manifest: window.TEST_MANIFEST,
      onComplete: (submission) => {
        console.log('Submission:', submission);
        // In a standalone file, we might want to offer to download the JSON results too
      },
      onExit: () => {
         // Standalone behavior for exit
         window.close();
      }
    })
  );
}
