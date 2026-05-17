import React from 'react';
import { Download, Copy, Check, AlertTriangle, XCircle, FileJson } from 'lucide-react';
import { DynamicTestManifest, validateDynamicTestManifest } from '../../schema/DynamicTestTypes';

interface ExportPanelProps {
  manifest: DynamicTestManifest;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ manifest }) => {
  const [copied, setCopied] = React.useState(false);
  const validation = validateDynamicTestManifest(manifest);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `manifest-${manifest.testId || 'untitled'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-bold mb-6">
           <FileJson className="w-5 h-5 text-slate-400" />
           Manifest Integrity
        </div>

        {validation.isValid ? (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-500" />
            <div className="text-sm text-emerald-800 font-medium">Manifest is valid and ready for export.</div>
          </div>
        ) : (
          <div className="space-y-3">
             <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div className="text-sm text-red-800 font-bold">Manifest has validation errors.</div>
             </div>
             <div className="pl-8 space-y-1">
                {validation.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> {err}
                  </div>
                ))}
             </div>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownload}
          disabled={!validation.isValid}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download .json
        </button>
        <button
          onClick={handleCopy}
          className="w-full bg-white text-slate-900 border-2 border-slate-200 font-bold py-4 px-6 rounded-2xl transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
          {copied ? 'Copied to Clipboard' : 'Copy JSON Source'}
        </button>
      </div>

      <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center">
        <p className="text-xs text-slate-400 font-medium">
          Note: This tool runs entirely in your browser.<br />Your assessment data is not saved to any server until you download it.
        </p>
      </div>
    </div>
  );
};
