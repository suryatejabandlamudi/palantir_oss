import { Search, Box } from 'lucide-react';
import { MCPTool, SystemType } from '@/lib/protocols';

// Mock Data for now, real app would fetch from Registry
const AVAILABLE_TOOLS: MCPTool[] = [
    { id: 't1', name: 'salesforce.get_opportunity', description: 'Find Opportunity by ID', schema: '{}', system: 'SALESFORCE' },
    { id: 't2', name: 'salesforce.update_stage', description: 'Move Deal to Negotiation', schema: '{}', system: 'SALESFORCE' },
    { id: 't3', name: 'sap.check_stock', description: 'Check global inventory', schema: '{}', system: 'SAP' },
    { id: 't4', name: 'servicenow.create_incident', description: 'Log a P1/P2 Ticket', schema: '{}', system: 'SERVICENOW' },
    { id: 't5', name: 'slack.post_message', description: 'Notify channel', schema: '{}', system: 'SLACK' },
    { id: 't6', name: 'gmail.send', description: 'Send Email', schema: '{}', system: 'EMAIL' },
    { id: 't7', name: 'workday.get_employee', description: 'Get Employee Details', schema: '{}', system: 'WORKDAY' },
];

interface ToolPickerProps {
    onSelect: (tool: MCPTool) => void;
}

export function ToolPicker({ onSelect }: ToolPickerProps) {
    return (
        <div className="w-64 bg-zinc-50 border-r border-zinc-200 h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-white">
                <div className="font-semibold text-sm text-zinc-900 mb-3 flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-600" /> MCP Toolkit
                </div>
                <div className="relative">
                    <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-400" />
                    <input
                        className="w-full bg-zinc-100 border-none rounded-md pl-8 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Search tools..."
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {AVAILABLE_TOOLS.map(tool => (
                    <div
                        key={tool.id}
                        onClick={() => onSelect(tool)}
                        className="group flex flex-col p-2.5 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <BadgeForSystem system={tool.system} />
                            <span className="text-xs font-medium text-zinc-900 truncate">{tool.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-snug">{tool.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BadgeForSystem({ system }: { system: SystemType }) {
    const map: Record<SystemType, string> = {
        SALESFORCE: 'bg-blue-100 text-blue-700',
        SAP: 'bg-indigo-100 text-indigo-700',
        SLACK: 'bg-purple-100 text-purple-700',
        TEAMS: 'bg-indigo-50 text-indigo-600',
        EMAIL: 'bg-yellow-100 text-yellow-700',
        WORKDAY: 'bg-orange-100 text-orange-700',
        SERVICENOW: 'bg-teal-100 text-teal-700',
        JIRA: 'bg-blue-50 text-blue-600',
        SPLUNK: 'bg-gray-800 text-white',
        CROWDSTRIKE: 'bg-red-100 text-red-700'
    };

    // Short code
    const label = system.substring(0, 3);

    return (
        <span className={`text-[9px] font-bold px-1 py-0.5 rounded tracking-tighter ${map[system] || 'bg-zinc-100'}`}>
            {label}
        </span>
    )
}
