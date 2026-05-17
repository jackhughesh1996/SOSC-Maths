/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
import { FloatingCalculator } from './components/FloatingCalculator';
import { BookOpen, GraduationCap } from 'lucide-react';
import { PracticeMode } from './components/PracticeMode';
import { ActiveTestMode } from './components/ActiveTestMode';
import { mockTests } from './data/mockTests';
import { FloatingGraph } from './components/FloatingGraph';
import { TestCreatorPage } from './assessment/creator/TestCreatorPage';
import { StandaloneTestRunner } from './assessment/runner/StandaloneTestRunner';
import { DEMO_MANIFEST } from './assessment/demoManifest';
import { LayoutGrid, Wrench, Radio, UserPlus } from 'lucide-react';
import { TeacherSessionPage } from './assessment/sync/TeacherSessionPage';
import { StudentJoinPage } from './assessment/sync/StudentJoinPage';

type AppMode = 'practice' | 'test_selection' | 'active_test' | 'creator' | 'demo_runner' | 'sync_teacher' | 'sync_student';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('practice');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col font-sans text-gray-900 ${appMode === 'practice' || appMode === 'test_selection' ? 'bg-[#f5f5f5]' : 'bg-white'}`}>
      {/* Top Header/Navigation */}
      {appMode !== 'active_test' && (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
             <div className="text-xl font-semibold text-gray-800 tracking-tight">Math Platform</div>
          </div>
          <div className="flex space-x-2">
            <button 
               onClick={() => setAppMode('practice')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${appMode === 'practice' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <BookOpen size={16} /> Practice
            </button>
            <button 
               onClick={() => setAppMode('test_selection')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${appMode === 'test_selection' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <GraduationCap size={16} /> Tests
            </button>
            <button 
               onClick={() => setAppMode('demo_runner')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${appMode === 'demo_runner' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <LayoutGrid size={16} /> Demo Runner
            </button>
            <button 
               onClick={() => setAppMode('creator')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${appMode === 'creator' ? 'bg-slate-100 text-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Wrench size={16} /> Creator
            </button>
            <button 
               onClick={() => setAppMode('sync_teacher')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${appMode === 'sync_teacher' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Radio size={16} /> Live Sync
            </button>
            <button 
               onClick={() => setAppMode('sync_student')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${appMode === 'sync_student' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <UserPlus size={16} /> Join Live
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${appMode === 'practice' || appMode === 'test_selection' ? 'p-6' : ''}`}>
        {appMode === 'practice' && (
          <PracticeMode 
            onToggleCalc={() => setIsCalculatorOpen((prev) => !prev)} 
            onToggleGraph={() => setIsGraphOpen((prev) => !prev)}
            onStartTest={() => setAppMode('test_selection')}
          />
        )}
        
        {appMode === 'test_selection' && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <GraduationCap size={48} className="mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-medium text-gray-800 mb-2">Available Tests</h2>
              <p className="text-sm text-gray-500 mb-6">Select a test to begin your examination.</p>
              
              <div className="flex flex-col gap-3">
                {mockTests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => setAppMode('active_test')}
                    className="flex flex-col items-start px-6 py-4 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-xl transition-all shadow-sm hover:shadow"
                  >
                    <span className="font-semibold text-gray-900">{test.title}</span>
                    <span className="text-xs text-gray-500 mt-1">{test.questions.length} Questions</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {appMode === 'active_test' && (
          <ActiveTestMode 
            test={mockTests[0]} 
            onExit={(mode?: 'practice' | 'test_selection') => setAppMode(mode || 'test_selection')} 
          />
        )}

        {appMode === 'creator' && (
          <TestCreatorPage />
        )}

        {appMode === 'demo_runner' && (
          <div className="flex-1 overflow-auto bg-slate-50">
            <StandaloneTestRunner 
              manifest={DEMO_MANIFEST} 
              onExit={() => setAppMode('practice')}
            />
          </div>
        )}

        {appMode === 'sync_teacher' && (
          <div className="flex-1 overflow-auto bg-white pt-10">
            <TeacherSessionPage manifest={DEMO_MANIFEST} />
          </div>
        )}

        {appMode === 'sync_student' && (
          <StudentJoinPage demoManifest={DEMO_MANIFEST} />
        )}
      </main>
      
      {isCalculatorOpen && appMode !== 'active_test' && (
        <FloatingCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      )}
      {isGraphOpen && appMode !== 'active_test' && (
        <FloatingGraph isOpen={isGraphOpen} onClose={() => setIsGraphOpen(false)} />
      )}
    </div>
  );
}
