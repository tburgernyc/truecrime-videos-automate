import { useState } from 'react';

export default function PackagingTools() {
  const [titles] = useState([
    "The Mystery That Baffled Detectives for Years",
    "This Perfect Crime Had One Fatal Flaw",
    "The Night Everything Went Wrong | True Crime",
    "How They Finally Caught Him After 10 Years",
    "The Evidence Everyone Missed | Crime Documentary"
  ]);

  const [tags] = useState([
    "true crime", "crime documentary", "unsolved mystery", "detective story",
    "forensic evidence", "cold case", "investigation", "criminal psychology"
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Title Variants</h4>
        <div className="space-y-2">
          {titles.map((title, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center justify-between hover:border-amber-500 transition cursor-pointer">
              <span className="text-slate-200">{title}</span>
              <button className="text-xs text-amber-400 hover:text-amber-300">Use</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-3">SEO Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
