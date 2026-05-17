import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { MathfieldElement } from 'mathlive';
import 'mathlive';
import { MATHFIELD_DEFAULT_OPTIONS } from '../lib/mathfieldConfig';

export interface MathInputHandle {
  insert: (latex: string) => void;
  focus: () => void;
  blur: () => void;
}

interface MathInputProps {
  value: string;
  onChange: (value: string, asciiValue: string) => void;
  onFocus?: () => void;
  className?: string;
  placeholder?: string;
}

export const MathInput = forwardRef<MathInputHandle, MathInputProps>(
  ({ value, onChange, onFocus, className = '', placeholder = '' }, ref) => {
    const mfRef = useRef<MathfieldElement>(null);
    
    useImperativeHandle(ref, () => ({
      insert: (latex: string) => {
        if (mfRef.current) {
          mfRef.current.insert(latex);
          // Get multiple formats for accuracy
          const latexValue = mfRef.current.getValue('latex');
          const asciiValue = mfRef.current.getValue('ascii-math');
          onChange(latexValue, asciiValue || latexValue);
        }
      },
      focus: () => mfRef.current?.focus(),
      blur: () => mfRef.current?.blur(),
    }));
    
    useEffect(() => {
      const mf = mfRef.current;
      if (!mf) return;
      
      // Use silenceNotifications to prevent sync loops and jumpy cursor
      if (mf.getValue('latex') !== value) {
        (mf as any).setValue(value, { silenceNotifications: true });
      }
    }, [value]);
    
    useEffect(() => {
      const mf = mfRef.current;
      if (!mf) return;
      
      (mf as any).setOptions({
        ...MATHFIELD_DEFAULT_OPTIONS,
        inlineShortcuts: {
          ...(mf as any).getOptions('inlineShortcuts'),
          ...MATHFIELD_DEFAULT_OPTIONS.inlineShortcuts,
        }
      });
      
      const handleInput = (e: Event) => {
        const target = e.target as MathfieldElement;
        const latexValue = target.getValue('latex');
        const asciiValue = target.getValue('ascii-math');
        onChange(latexValue, asciiValue || latexValue);
      };

      const handleFocus = () => {
        onFocus?.();
      };
      
      mf.addEventListener('input', handleInput);
      mf.addEventListener('focus', handleFocus);
      mf.addEventListener('click', handleFocus);
      
      return () => {
        mf.removeEventListener('input', handleInput);
        mf.removeEventListener('focus', handleFocus);
        mf.removeEventListener('click', handleFocus);
      };
    }, [onChange, onFocus]);
    
    return (
      <div className={`relative ${className}`}>
        <math-field 
          ref={mfRef} 
          math-virtual-keyboard-policy="manual"
          style={{
            width: '100%',
            padding: '0 0.5rem',
            fontSize: '1em',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
          }}
        />
      </div>
    );
  }
);

MathInput.displayName = 'MathInput';
