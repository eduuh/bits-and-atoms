'use client';

import { useRef, useState, useEffect, ComponentPropsWithoutRef } from 'react';
import { CopyButton } from './CopyButton';

type PreProps = ComponentPropsWithoutRef<'pre'>;

export function CodeBlock({ children, ...props }: PreProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (preRef.current) {
      const codeElement = preRef.current.querySelector('code');
      if (codeElement) {
        setCode(codeElement.textContent || '');
      }
    }
  }, [children]);

  return (
    <div className="code-block-wrapper group relative">
      <CopyButton code={code} />
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
