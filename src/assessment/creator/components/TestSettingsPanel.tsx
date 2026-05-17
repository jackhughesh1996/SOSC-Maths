import React from 'react';
import { Settings, Shield, Clock, PlayCircle } from 'lucide-react';
import { DynamicTestManifest } from '../../schema/DynamicTestTypes';

type StartMode = DynamicTestManifest['delivery']['startMode'];

const START_MODES: StartMode[] = ['studentManual', 'fixedTime', 'teacherStart'];

const toStartMode = (value: string): StartMode =>
  START_MODES.includes(value as StartMode) ? (value as StartMode) : 'studentManual';

interface TestSettingsPanelProps {
  manifest: DynamicTestManifest;
  onChange: (updates: Partial<DynamicTestManifest>) => void;
}

export const TestSettingsPanel: React.FC<TestSettingsPanelProps> = ({ manifest, onChange }) => {
  const handleDeliveryChange = (updates: Partial<DynamicTestManifest['delivery']>) => {
    onChange({ delivery: { ...manifest.delivery, ...updates } });
  };

  const handleSecurityChange = (updates: Partial<DynamicTestManifest['security']>) => {
    onChange({ security: { ...manifest.security, ...updates } });
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
          <Settings className="w-5 h-5 text-slate-400" />
          General Settings
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
              value={manifest.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Algebra Fundamentals"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
              rows={2}
              value={manifest.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Brief overview for students..."
            />
          </div>
        </div>
      </section>

      {/* Delivery Settings */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Delivery & Timing
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Seconds)</label>
            <input
              type="number"
              className="w-full px-4 py-2 rounded-lg border border-slate-300"
              value={manifest.delivery.durationSeconds}
              onChange={(e) => handleDeliveryChange({ durationSeconds: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-slate-400 mt-1">{Math.floor(manifest.delivery.durationSeconds / 60)} minutes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Mode</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-300"
              value={manifest.delivery.startMode}
              onChange={(e) => handleDeliveryChange({ startMode: toStartMode(e.target.value) })}
            >
              <option value="studentManual">Student Starts Manually</option>
              <option value="teacherStart">Teacher Triggered (Sync)</option>
              <option value="fixedTime">Fixed Start Time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoSubmit"
              className="w-4 h-4 text-slate-900 rounded"
              checked={manifest.delivery.autoSubmitOnExpiry}
              onChange={(e) => handleDeliveryChange({ autoSubmitOnExpiry: e.target.checked })}
            />
            <label htmlFor="autoSubmit" className="text-sm font-medium text-slate-700">Auto-submit when timer expires</label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requireName"
              className="w-4 h-4 text-slate-900 rounded"
              checked={manifest.delivery.requireStudentName}
              onChange={(e) => handleDeliveryChange({ requireStudentName: e.target.checked })}
            />
            <label htmlFor="requireName" className="text-sm font-medium text-slate-700">Require student name input</label>
          </div>
        </div>
      </section>

      {/* Security Settings */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
          <Shield className="w-5 h-5 text-slate-400" />
          Integrity & Proctoring
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="text-sm font-bold text-slate-900">Track Tab Visibility</div>
              <div className="text-xs text-slate-500">Log whenever a student switches tabs or minimizes the browser.</div>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 text-slate-900 rounded"
              checked={manifest.security.trackTabVisibility}
              onChange={(e) => handleSecurityChange({ trackTabVisibility: e.target.checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Hidden Seconds before Flag</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-slate-300"
                value={manifest.security.maxHiddenSecondsBeforeFlag}
                onChange={(e) => handleSecurityChange({ maxHiddenSecondsBeforeFlag: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Tab Switches before Flag</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-slate-300"
                value={manifest.security.maxHiddenEventsBeforeFlag}
                onChange={(e) => handleSecurityChange({ maxHiddenEventsBeforeFlag: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
