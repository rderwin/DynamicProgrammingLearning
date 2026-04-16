import { useState } from "react";

interface Props {
  prompt: string;
  onSubmit: (response: string) => void;
}

export default function ExplainBack({ prompt, onSubmit }: Props) {
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (response.trim().length < 10) return;
    setSubmitted(true);
    onSubmit(response);
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✍️</span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Nice explanation!</span>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 italic leading-relaxed">
          Writing it in your own words is one of the most effective ways to learn.
          Research shows that retrieval practice (recalling from memory) beats re-reading by a wide margin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✍️</span>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Explain it back</h4>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{prompt}</p>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Type your explanation here..."
        className="w-full h-20 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-600 transition-all"
      />
      <div className="flex items-center justify-between mt-2">
        <span className={`text-[10px] ${response.trim().length < 10 ? "text-slate-400 dark:text-slate-600" : "text-emerald-500"}`}>
          {response.trim().length < 10 ? `${10 - response.trim().length} more characters` : "✓ Ready"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={response.trim().length < 10}
          className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
