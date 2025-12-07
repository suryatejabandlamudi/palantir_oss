import React from 'react';

interface PanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    headerAction?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ children, className = '', title, headerAction }) => {
    return (
        <div className={`bg-[#1C2127] border border-gray-800 flex flex-col ${className}`}>
            {(title || headerAction) && (
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-[#252A31]">
                    {title && <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{title}</h3>}
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="p-4 flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
};
