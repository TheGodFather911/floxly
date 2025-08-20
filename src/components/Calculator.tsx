import React, { useState } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Calculator() {
  const { theme } = useTheme();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const Button = ({ onClick, className, children, ...props }: any) => (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <div className={`${theme.cardBackground} rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center gap-2 mb-4">
        <CalcIcon className={`w-5 h-5 ${theme.accent}`} />
        <h2 className={`text-lg font-semibold ${theme.text}`}>Calculator</h2>
      </div>

      {/* Display */}
      <div className={`p-4 rounded-xl bg-black/20 border ${theme.border} mb-4`}>
        <div className={`text-right text-2xl font-mono ${theme.text}`}>
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          onClick={clear}
          className={`col-span-2 bg-red-500/20 text-red-400 hover:bg-red-500/30`}
        >
          Clear
        </Button>
        <Button
          onClick={() => setDisplay(display.slice(0, -1) || '0')}
          className={`bg-white/10 ${theme.text} hover:bg-white/20`}
        >
          <Delete className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => inputOperation('÷')}
          className={`${theme.primary} ${theme.primaryHover} text-white`}
        >
          ÷
        </Button>

        {[7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => inputNumber(String(num))}
            className={`bg-white/10 ${theme.text} hover:bg-white/20`}
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => inputOperation('×')}
          className={`${theme.primary} ${theme.primaryHover} text-white`}
        >
          ×
        </Button>

        {[4, 5, 6].map((num) => (
          <Button
            key={num}
            onClick={() => inputNumber(String(num))}
            className={`bg-white/10 ${theme.text} hover:bg-white/20`}
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => inputOperation('-')}
          className={`${theme.primary} ${theme.primaryHover} text-white`}
        >
          -
        </Button>

        {[1, 2, 3].map((num) => (
          <Button
            key={num}
            onClick={() => inputNumber(String(num))}
            className={`bg-white/10 ${theme.text} hover:bg-white/20`}
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={() => inputOperation('+')}
          className={`${theme.primary} ${theme.primaryHover} text-white`}
        >
          +
        </Button>

        <Button
          onClick={() => inputNumber('0')}
          className={`col-span-2 bg-white/10 ${theme.text} hover:bg-white/20`}
        >
          0
        </Button>
        <Button
          onClick={() => inputNumber('.')}
          className={`bg-white/10 ${theme.text} hover:bg-white/20`}
        >
          .
        </Button>
        <Button
          onClick={performCalculation}
          className={`bg-green-600 hover:bg-green-700 text-white`}
        >
          =
        </Button>
      </div>
    </div>
  );
}