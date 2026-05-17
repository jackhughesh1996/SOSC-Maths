import React from 'react';
import { FileJson, Code, Eye } from 'lucide-react';
import { DynamicTestManifest } from '../../schema/DynamicTestTypes';

interface ManifestPreviewProps {
  manifest: DynamicTestManifest;
}

export const ManifestPreview: React.FC<ManifestPreviewProps> = ({ manifest }) => {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
        <FileJson className="w-5 h-5 text-slate-400" />
        Manifest Source (JSON)
      </div>
      
      <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative group">
        <div className="absolute top-4 right-4 flex gap-2">
           <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
             <Code className="w-3 h-3" /> mathgraph-test-v1
           </div>
        </div>
        
        <pre className="p-8 text-indigo-300 font-mono text-sm overflow-auto h-full scrollbar-hide selection:bg-white/10">
          {JSON.stringify(manifest, null, 2)}
        </pre>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <Eye className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          This JSON represents the authoritative state of your assessment. 
          Use the <strong>Export Panel</strong> to download this file for use in the runner.
        </div>
      </div>
    </div>
  );
};
