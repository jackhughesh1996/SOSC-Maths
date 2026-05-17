import { useState } from 'react';
import 'mafs/core.css';
import 'mafs/font.css';

import { useFullscreen } from '../../../hooks/useFullscreen';
import { useGraphingCalculator } from '../hooks/useGraphingCalculator';
import { GraphCanvas } from './GraphCanvas';
import { GraphSidebar } from './GraphSidebar';

export function GraphingCalculator() {
  const [mafsResetKey, setMafsResetKey] = useState(0);
  const {
    expressions,
    parsedExpressions,
    angleMode,
    pointPlotting,
    setAngleMode,
    setFocusedId,
    setPointPlotting,
    addExpression,
    updateExpression,
    removeExpression,
    handleInsert,
    handleGraphClick,
    registerInput,
  } = useGraphingCalculator();

  const {
    containerRef: fullscreenRef,
    isFullscreen,
    fullscreenError,
    toggleFullscreen,
  } = useFullscreen<HTMLDivElement>();

  return (
    <div
      ref={fullscreenRef}
      className={[
        'flex w-full h-full bg-white',
        isFullscreen ? 'fixed inset-0 z-50 flex-col md:flex-row' : 'flex-col md:flex-row',
      ].join(' ')}
    >
      <GraphSidebar
        expressions={expressions}
        parsedExpressions={parsedExpressions}
        angleMode={angleMode}
        pointPlotting={pointPlotting}
        isFullscreen={isFullscreen}
        onAngleModeChange={setAngleMode}
        onPointPlottingChange={setPointPlotting}
        onAddExpression={addExpression}
        onUpdateExpression={updateExpression}
        onRemoveExpression={removeExpression}
        onFocusExpression={setFocusedId}
        onRegisterInput={registerInput}
        onInsertFunction={handleInsert}
      />

      <GraphCanvas
        parsedExpressions={parsedExpressions}
        mafsResetKey={mafsResetKey}
        isFullscreen={isFullscreen}
        fullscreenError={fullscreenError}
        onGraphClick={handleGraphClick}
        onResetView={() => setMafsResetKey((value) => value + 1)}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
