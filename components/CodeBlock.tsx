
import React from 'react';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  return (
    <div className="bg-black/50 rounded-lg overflow-hidden">
      <pre className="p-4 text-sm text-brand-text-primary whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
