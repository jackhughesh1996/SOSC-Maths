import React from 'react';
import { Plus, Trash2, Award, ListChecks } from 'lucide-react';
import { DynamicTestManifest, RubricSkill, MasteryBand } from '../../schema/DynamicTestTypes';

interface RubricEditorProps {
  manifest: DynamicTestManifest;
  onChange: (updates: Partial<DynamicTestManifest>) => void;
}

export const RubricEditor: React.FC<RubricEditorProps> = ({ manifest, onChange }) => {
  const updateRubric = (updates: Partial<DynamicTestManifest['rubric']>) => {
    onChange({ rubric: { ...manifest.rubric, ...updates } });
  };

  const addSkill = () => {
    const newSkill: RubricSkill = {
      id: `skill-${Date.now()}`,
      name: 'New Skill',
      description: ''
    };
    updateRubric({ skills: [...manifest.rubric.skills, newSkill] });
  };

  const removeSkill = (id: string) => {
    updateRubric({ skills: manifest.rubric.skills.filter(s => s.id !== id) });
  };

  const updateSkill = (id: string, updates: Partial<RubricSkill>) => {
    updateRubric({
      skills: manifest.rubric.skills.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const addBand = () => {
    const newBand: MasteryBand = {
      id: `band-${Date.now()}`,
      label: 'New Band',
      minPercent: 0
    };
    updateRubric({ masteryBands: [...manifest.rubric.masteryBands, newBand] });
  };

  const removeBand = (id: string) => {
    updateRubric({ masteryBands: manifest.rubric.masteryBands.filter(b => b.id !== id) });
  };

  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ListChecks className="w-5 h-5 text-slate-400" />
            Skills & Strands
          </div>
          <button
            onClick={addSkill}
            className="flex items-center gap-1 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>

        <div className="space-y-4">
          {manifest.rubric.skills.map((skill) => (
            <div key={skill.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 relative group">
              <button
                onClick={() => removeSkill(skill.id)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skill Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-slate-900"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skill ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100/50"
                    value={skill.id}
                    onChange={(e) => updateSkill(skill.id, { id: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mastery Bands Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Award className="w-5 h-5 text-slate-400" />
            Mastery Bands
          </div>
          <button
            onClick={addBand}
            className="flex items-center gap-1 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Band
          </button>
        </div>

        <div className="space-y-3">
          {manifest.rubric.masteryBands.sort((a,b) => b.minPercent - a.minPercent).map((band) => (
            <div key={band.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl bg-slate-50 group">
              <div className="flex-1">
                 <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg bg-transparent border-none font-bold text-slate-900 focus:ring-0"
                    value={band.label}
                    onChange={(e) => {
                      updateRubric({
                        masteryBands: manifest.rubric.masteryBands.map(b => b.id === band.id ? { ...b, label: e.target.value } : b)
                      });
                    }}
                  />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 font-mono">Min %</span>
                <input
                  type="number"
                  className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-center"
                  value={band.minPercent}
                  onChange={(e) => {
                    updateRubric({
                      masteryBands: manifest.rubric.masteryBands.map(b => b.id === band.id ? { ...b, minPercent: parseInt(e.target.value) || 0 } : b)
                    });
                  }}
                />
              </div>
              <button
                onClick={() => removeBand(band.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
