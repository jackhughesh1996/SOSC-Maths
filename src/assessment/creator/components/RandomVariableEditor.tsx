import React from 'react';
import { Plus, Trash2, Variable, Cpu } from 'lucide-react';
import { DynamicTestManifest, RandomVariableDefinition } from '../../schema/DynamicTestTypes';

type RandomVariableType = RandomVariableDefinition['type'];

const toVariableDefinitionForType = (type: string): RandomVariableDefinition => {
  switch (type as RandomVariableType) {
    case 'integer':
      return { type: 'integer', min: 1, max: 10 };
    case 'decimal':
      return { type: 'decimal', min: 0, max: 1, decimals: 2 };
    case 'choice':
      return { type: 'choice', values: ['A', 'B'] };
    case 'derived':
      return { type: 'derived', expression: '1 + 1' };
    default:
      return { type: 'integer', min: 1, max: 10 };
  }
};

interface RandomVariableEditorProps {
  manifest: DynamicTestManifest;
  onChange: (updates: Partial<DynamicTestManifest>) => void;
}

export const RandomVariableEditor: React.FC<RandomVariableEditorProps> = ({ manifest, onChange }) => {
  const updateVariables = (variables: Record<string, RandomVariableDefinition>) => {
    onChange({ randomization: { ...manifest.randomization, variables } });
  };

  const addVariable = () => {
    const name = `var_${Object.keys(manifest.randomization.variables).length + 1}`;
    updateVariables({
      ...manifest.randomization.variables,
      [name]: { type: 'integer', min: 1, max: 10 }
    });
  };

  const removeVariable = (name: string) => {
    const newVars = { ...manifest.randomization.variables };
    delete newVars[name];
    updateVariables(newVars);
  };

  const updateVariable = (name: string, definition: RandomVariableDefinition) => {
    updateVariables({
      ...manifest.randomization.variables,
      [name]: definition
    });
  };

  const renameVariable = (oldName: string, newName: string) => {
    if (oldName === newName || !newName) return;
    const newVars = { ...manifest.randomization.variables };
    const existingDefinition = newVars[oldName];
    if (!existingDefinition) return;
    newVars[newName] = existingDefinition;
    delete newVars[oldName];
    updateVariables(newVars);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Variable className="w-5 h-5 text-slate-400" />
            Random Variables
          </div>
          <button
            onClick={addVariable}
            className="flex items-center gap-1 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Variable
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(manifest.randomization.variables).map(([name, def]) => (
            <div key={name} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 relative group">
              <button
                onClick={() => removeVariable(name)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-900"
                    value={name}
                    onChange={(e) => renameVariable(name, e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</label>
                  <select
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                    value={def.type}
                    onChange={(e) => updateVariable(name, toVariableDefinitionForType(e.target.value))}
                  >
                    <option value="integer">Integer</option>
                    <option value="decimal">Decimal</option>
                    <option value="choice">Choice</option>
                    <option value="derived">Derived (Formula)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Configuration</div>
                  
                  {def.type === 'integer' && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                        value={def.min}
                        onChange={(e) => updateVariable(name, { ...def, min: parseInt(e.target.value) || 0 })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                        value={def.max}
                        onChange={(e) => updateVariable(name, { ...def, max: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  {def.type === 'derived' && (
                    <div className="relative">
                      <Cpu className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. var1 * 2 + 5"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                        value={def.expression}
                        onChange={(e) => updateVariable(name, { ...def, expression: e.target.value })}
                      />
                    </div>
                  )}

                  {def.type === 'choice' && (
                    <input
                      type="text"
                      placeholder="comma-separated values"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                      value={def.values.join(', ')}
                      onChange={(e) => updateVariable(name, { ...def, values: e.target.value.split(',').map(v => v.trim()) })}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {Object.keys(manifest.randomization.variables).length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              No variables defined. Question prompts will remain static.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
