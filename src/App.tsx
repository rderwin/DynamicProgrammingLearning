import FibonacciLesson from "./components/FibonacciLesson";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              DP Learning Lab
            </h1>
            <p className="text-sm text-slate-500">
              Dynamic programming from zero to interview-ready
            </p>
          </div>
          <nav className="flex gap-1 bg-slate-100 rounded-lg p-1 text-sm">
            <button className="px-3 py-1.5 rounded-md bg-white shadow-sm font-medium text-slate-800">
              Fibonacci
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-400 cursor-not-allowed">
              Climbing Stairs
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-400 cursor-not-allowed">
              Grid Paths
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-400 cursor-not-allowed">
              Coin Change
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-400 cursor-not-allowed">
              Knapsack
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <FibonacciLesson />
      </main>
    </div>
  );
}

export default App;
