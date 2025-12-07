import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <input
                className={`
          bg-[#111418] border border-gray-700 text-gray-200 text-sm px-3 py-2 
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
          placeholder-gray-600 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};
