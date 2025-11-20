'use client';

import React, { ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface WorkspaceLayoutProps {
    sidebar: ReactNode;
    children: ReactNode; // Main Content
    bottomPanel?: ReactNode;
    defaultSidebarSize?: number;
    defaultBottomSize?: number;
}

export default function WorkspaceLayout({
    sidebar,
    children,
    bottomPanel,
    defaultSidebarSize = 20,
    defaultBottomSize = 30,
}: WorkspaceLayoutProps) {
    return (
        <div className="h-screen w-screen bg-[#0B0C0E] text-gray-300 overflow-hidden font-sans">
            <PanelGroup direction="horizontal">
                {/* Sidebar */}
                <Panel defaultSize={defaultSidebarSize} minSize={15} maxSize={40} className="bg-[#111418] border-r border-gray-800 flex flex-col">
                    {sidebar}
                </Panel>

                <PanelResizeHandle className="w-1 bg-gray-900 hover:bg-blue-600 transition-colors flex items-center justify-center group">
                    <GripVertical className="h-4 w-4 text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100" />
                </PanelResizeHandle>

                {/* Main Content Area */}
                <Panel minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel minSize={30} className="bg-[#0B0C0E] flex flex-col relative">
                            {children}
                        </Panel>

                        {bottomPanel && (
                            <>
                                <PanelResizeHandle className="h-1 bg-gray-900 hover:bg-blue-600 transition-colors flex items-center justify-center group">
                                    <GripHorizontal className="h-4 w-4 text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100" />
                                </PanelResizeHandle>

                                <Panel defaultSize={defaultBottomSize} minSize={10} maxSize={60} className="bg-[#111418] border-t border-gray-800 flex flex-col">
                                    {bottomPanel}
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}
