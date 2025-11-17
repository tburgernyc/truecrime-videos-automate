import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <span className="text-sm font-medium text-slate-300">JSON Output</span>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded transition"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-xs text-slate-300 font-mono overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
