import { Test } from '../types/test';

export const mockTests: Test[] = [
  {
    id: 'test-001',
    title: 'Algebra Midterm',
    questions: [
      {
        id: 'q-1',
        text: 'Solve for x: $2x + 5 = 15$',
        calculatorConfig: {
          allowed: false, // Mental math, no calculator allowed
        },
      },
      {
        id: 'q-2',
        text: 'Calculate the hypotenuse $x$ of a right angle triangle with sides of length 3 and 4.',
        diagram: {
          url: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpolygon points='50,150 150,150 50,50' fill='%23f3f4f6' stroke='%23374151' stroke-width='3' stroke-linejoin='round'/%3E%3Cpolyline points='50,135 65,135 65,150' fill='none' stroke='%23374151' stroke-width='3'/%3E%3Ctext x='95' y='175' font-family='sans-serif' font-size='18' font-weight='500' fill='%23374151'%3E4%3C/text%3E%3Ctext x='25' y='105' font-family='sans-serif' font-size='18' font-weight='500' fill='%23374151'%3E3%3C/text%3E%3Ctext x='110' y='90' font-family='sans-serif' font-size='18' font-weight='500' fill='%23374151' font-style='italic'%3Ex%3C/text%3E%3C/svg%3E",
          alt: "Right angle triangle with base 4 and height 3, searching for hypotenuse x"
        },
        calculatorConfig: {
          allowed: true,
          allowAdvanced: false, // Basic calculator only
          allowHistory: true,
        },
      },
      {
        id: 'q-3',
        text: 'Find the value of $4 \\sin(30^\\circ) + 2^3$.',
        calculatorConfig: {
          allowed: true,
          allowAdvanced: true,  // Requires sin() and ^ 
          allowHistory: false,  // Don't want them looking at previous answers
        },
      },
    ],
  },
  {
    id: 'test-002',
    title: 'Calculus Quiz 1',
    questions: [
      {
        id: 'q-1',
        text: 'Find the derivative of $f(x) = x^3 + 2x^2 - 5x + 1$.',
        calculatorConfig: {
          allowed: true,
          allowAdvanced: true,
          allowHistory: true,
        },
      },
      {
        id: 'q-2',
        type: 'graph_points',
        text: 'Plot all the local extrema for the function $y = x^3 - 3x$. \n\n*Hint: Find where $y\' = 0$.*',
        expectedPoints: [{ x: 1, y: -2 }, { x: -1, y: 2 }],
        calculatorConfig: {
          allowed: true,
          allowAdvanced: true,
        }
      }
    ]
  }
];
