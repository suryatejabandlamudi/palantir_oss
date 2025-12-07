import { ChatWidget } from "../components/ChatWidget";
import { AgentSimulationPanel } from "../components/AgentSimulationPanel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      {/* Navbar */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-black font-bold text-xl">N</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Nexus OS</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Header */}
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Enterprise Overview</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Welcome back. Here is the status of your connected systems.</p>
          </div>

          {/* Stats Grid - CRISIS MODE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Grid Stability", value: "CRITICAL (0 MW)", color: "bg-red-500 animate-pulse" },
              { label: "Active Threat", value: "TRITON Malware", color: "bg-red-500" },
              { label: "Response Crews", value: "1 Unit Dispatched", color: "bg-yellow-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
                {stat.label === "Grid Stability" && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                  <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Agent Simulation Panel */}
          <AgentSimulationPanel />
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
