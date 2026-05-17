export interface PointType {
  x: number;
  y: number;
}

export interface CalculatorConfig {
  allowed: boolean;
  allowAdvanced?: boolean;
  allowHistory?: boolean;
}

export interface Question {
  id: string;
  type?: 'text' | 'graph_points';
  text: string;
  diagram?: {
    url: string;
    alt: string;
  };
  calculatorConfig: CalculatorConfig;
  expectedPoints?: PointType[];
}

export interface Test {
  id: string;
  title: string;
  questions: Question[];
}
