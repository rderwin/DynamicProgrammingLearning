interface Props {
  onContinue: () => void;
  content: TransitionContent;
}

export interface TransitionContent {
  /** What just happened */
  fromLabel: string;
  toLabel: string;
  /** Recap of what they learned */
  recap: {
    title: string;
    points: string[];
  };
  /** New concept / vocabulary */
  concept: {
    term: string;
    definition: string;
    example: string;
  };
  /** Pattern recognition */
  spotIt: {
    title: string;
    signs: string[];
  };
  /** Preview of next problem */
  preview: {
    title: string;
    description: string;
    whatsNew: string;
  };
}

export default function TransitionLesson({ onContinue, content }: Props) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-sm text-slate-400 mb-4">
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium text-xs">
            ✓ {content.fromLabel}
          </span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium text-xs">
            {content.toLabel}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Before we move on...</h2>
        <p className="text-slate-500">Let's lock in what you've learned and see how it connects to what's next.</p>
      </div>

      {/* Recap */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-emerald-800">{content.recap.title}</h3>
        </div>
        <ul className="space-y-2">
          {content.recap.points.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
              <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* New concept */}
      <div className="bg-violet-50/80 border border-violet-200 rounded-xl p-6 mb-6 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-violet-800">New concept: {content.concept.term}</h3>
        </div>
        <p className="text-sm text-violet-700 mb-3">{content.concept.definition}</p>
        <div className="bg-violet-100/60 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-violet-600 mb-1">Example</p>
          <p className="text-sm text-violet-800">{content.concept.example}</p>
        </div>
      </div>

      {/* How to spot it */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 mb-6 animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-amber-800">{content.spotIt.title}</h3>
        </div>
        <div className="space-y-2">
          {content.spotIt.signs.map((sign, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-amber-700">
              <span className="bg-amber-200 text-amber-800 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{sign}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next up */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-6 mb-8 animate-fade-in-up delay-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-blue-800">Next up: {content.preview.title}</h3>
        </div>
        <p className="text-sm text-blue-700 mb-3">{content.preview.description}</p>
        <div className="bg-blue-100/60 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-blue-600 mb-1">What's different</p>
          <p className="text-sm text-blue-800">{content.preview.whatsNew}</p>
        </div>
      </div>

      {/* Continue */}
      <div className="text-center animate-fade-in-up delay-400">
        <button
          onClick={onContinue}
          className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Start {content.toLabel}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
