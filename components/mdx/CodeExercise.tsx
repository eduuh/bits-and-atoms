'use client';

import { useState, useCallback } from 'react';
import { Play, RotateCcw, Lightbulb, Eye, EyeOff, CheckCircle2, XCircle, Circle } from 'lucide-react';

interface TestCase {
  input: unknown;
  expected: unknown;
  description?: string;
}

interface CodeExerciseProps {
  title: string;
  description?: string;
  starterCode: string;
  tests: TestCase[];
  solution: string;
  hints?: string[];
  functionName?: string;
}

type TestStatus = 'pending' | 'passed' | 'failed';

interface TestResult {
  status: TestStatus;
  actual?: unknown;
  error?: string;
}

// NOTE: This component intentionally uses Function constructor to evaluate
// user-provided code in the browser for educational purposes. This is safe because:
// 1. Code only runs client-side in the user's own browser
// 2. No server-side code execution
// 3. This is the intended purpose of an interactive code exercise

export function CodeExercise({
  title,
  description,
  starterCode,
  tests,
  solution,
  hints = [],
  functionName,
}: CodeExerciseProps) {
  const [code, setCode] = useState(starterCode.trim());
  const [testResults, setTestResults] = useState<TestResult[]>(
    tests.map(() => ({ status: 'pending' as TestStatus }))
  );
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const extractFunctionName = useCallback(() => {
    if (functionName) return functionName;
    // Try to extract function name from code
    const match = code.match(/function\s+(\w+)/);
    return match ? match[1] : 'solution';
  }, [code, functionName]);

  const runTests = useCallback(() => {
    setIsRunning(true);
    const results: TestResult[] = [];
    const fnName = extractFunctionName();

    for (const test of tests) {
      try {
        // Create a function that defines the user's code and calls it
        // This is intentional for an educational code exercise component
        const wrappedCode = `
          ${code}
          return ${fnName}(input);
        `;
        const fn = new Function('input', wrappedCode);
        const actual = fn(test.input);

        // Deep equality check
        const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
        results.push({
          status: passed ? 'passed' : 'failed',
          actual,
        });
      } catch (err) {
        results.push({
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  }, [code, tests, extractFunctionName]);

  const reset = useCallback(() => {
    setCode(starterCode.trim());
    setTestResults(tests.map(() => ({ status: 'pending' })));
    setShowHints(false);
    setCurrentHint(0);
    setShowSolution(false);
  }, [starterCode, tests]);

  const revealSolution = useCallback(() => {
    setCode(solution.trim());
    setShowSolution(true);
  }, [solution]);

  const allPassed = testResults.every(r => r.status === 'passed');
  const anyRun = testResults.some(r => r.status !== 'pending');

  const formatValue = (value: unknown): string => {
    if (typeof value === 'string') return `"${value}"`;
    return JSON.stringify(value);
  };

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-border not-prose">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          {allPassed && anyRun && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              Completed!
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Code Editor */}
      <div className="relative bg-gray-900">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={reset}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Reset code"
            aria-label="Reset code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full min-h-[150px] p-4 font-mono text-sm bg-transparent text-white resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-b border-gray-700 bg-gray-800">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>

        {hints.length > 0 && (
          <button
            onClick={() => {
              if (showHints && currentHint < hints.length - 1) {
                setCurrentHint(prev => prev + 1);
              } else {
                setShowHints(!showHints);
                setCurrentHint(0);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-amber-600 hover:bg-amber-500 text-white transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            {showHints ? `Next Hint (${currentHint + 1}/${hints.length})` : 'Hint'}
          </button>
        )}

        <button
          onClick={() => showSolution ? reset() : revealSolution()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
        >
          {showSolution ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Solution
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show Solution
            </>
          )}
        </button>
      </div>

      {/* Hints */}
      {showHints && hints.length > 0 && (
        <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-100">{hints[currentHint]}</p>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="px-4 py-3 bg-gray-950">
        <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Test Cases
        </h5>
        <div className="space-y-2">
          {tests.map((test, i) => {
            const result = testResults[i];
            const StatusIcon = result.status === 'passed'
              ? CheckCircle2
              : result.status === 'failed'
                ? XCircle
                : Circle;
            const statusColor = result.status === 'passed'
              ? 'text-green-400'
              : result.status === 'failed'
                ? 'text-red-400'
                : 'text-gray-500';

            return (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded-md ${
                  result.status === 'passed'
                    ? 'bg-green-500/10'
                    : result.status === 'failed'
                      ? 'bg-red-500/10'
                      : 'bg-gray-800/50'
                }`}
              >
                <StatusIcon className={`h-4 w-4 mt-0.5 ${statusColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-gray-300">
                    {test.description || (
                      <>
                        {extractFunctionName()}({formatValue(test.input)}) === {formatValue(test.expected)}
                      </>
                    )}
                  </div>
                  {result.status === 'failed' && (
                    <div className="mt-1 font-mono text-xs text-red-400">
                      {result.error ? (
                        <>Error: {result.error}</>
                      ) : (
                        <>Got: {formatValue(result.actual)}</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
