import React, { useState } from 'react';
import { Play, ClipboardList, Clock, ShieldCheck } from 'lucide-react';
import { DynamicTestManifest } from '../../schema/DynamicTestTypes';

interface StudentStartScreenProps {
  manifest: DynamicTestManifest;
  onStart: (studentName: string) => void;
}

export const StudentStartScreen: React.FC<StudentStartScreenProps> = ({ manifest, onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{manifest.title}</h1>
          {manifest.description && (
            <p className="text-slate-400">{manifest.description}</p>
          )}
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Duration</h3>
                <p className="text-sm text-slate-500">{Math.floor(manifest.delivery.durationSeconds / 60)} minutes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <ClipboardList className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Questions</h3>
                <p className="text-sm text-slate-500">{manifest.questions.length} items</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Tracking</h3>
                <p className="text-sm text-slate-500">
                  {manifest.security.trackTabVisibility ? 'Tab activity monitored' : 'Standard session'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-100">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-2">
                Your Full Name
              </label>
              <input
                id="studentName"
                type="text"
                required
                autoFocus
                placeholder="Enter your name to begin..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              Start Assessment
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Powered by MathGraph Pro • {manifest.engine.mathUtilsVersion}
          </p>
        </div>
      </div>
    </div>
  );
};
