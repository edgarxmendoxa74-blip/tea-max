import React from 'react';

const EnvStatus: React.FC = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const mask = (str: string | undefined) => {
        if (!str) return 'Missing';
        if (str.length <= 8) return '********';
        return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
    };

    return (
        <div className="bg-natalna-dark/50 backdrop-blur-sm border border-natalna-gold/20 rounded-lg p-4 text-xs font-mono text-natalna-cream/60">
            <h4 className="text-natalna-gold font-bold mb-2 uppercase tracking-widest text-[10px]">Environment Configuration</h4>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>URL:</span>
                    <span className={supabaseUrl ? 'text-green-400' : 'text-red-400'}>{mask(supabaseUrl)}</span>
                </div>
                <div className="flex justify-between">
                    <span>KEY:</span>
                    <span className={supabaseAnonKey ? 'text-green-400' : 'text-red-400'}>{mask(supabaseAnonKey)}</span>
                </div>
            </div>
        </div>
    );
};

export default EnvStatus;
