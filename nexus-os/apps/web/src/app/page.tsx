import { ChatWidget } from "../components/ChatWidget";

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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "ERP Status", value: "Connected", color: "bg-green-500" },
              { label: "CRM Sync", value: "Active", color: "bg-blue-500" },
              { label: "Active Incidents", value: "3", color: "bg-orange-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                  <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Placeholder Content */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 min-h-[400px] flex items-center justify-center border-dashed">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Analytics Dashboard</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Select a module from the sidebar to view detailed analytics.
                Or ask the <strong>Nexus Agent</strong> to pull specific reports for you.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
