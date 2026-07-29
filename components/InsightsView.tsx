import React from 'react';
import { ChartIcon, DuplicateIcon, MagicIcon } from './icons';
import { AnalysisResults } from '../types';
import { useAppContext } from '../AppContext';

interface InsightsViewProps {
    results: AnalysisResults;
}

const InsightCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-600 pb-2 flex items-center space-x-2">
            {icon}
            <span>{title}</span>
        </h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const InsightRow: React.FC<{ label: string, value: number, onClick: () => void }> = ({ label, value, onClick }) => (
    <div 
        onClick={onClick}
        className="flex justify-between items-center p-2 rounded-md hover:bg-slate-800 cursor-pointer transition-colors"
    >
        <span className="text-sm text-slate-300 truncate">{label}</span>
        <span className="text-sm font-semibold bg-slate-700/50 text-white px-2.5 py-1 rounded-full">{value.toLocaleString()}</span>
    </div>
);

export function InsightsView({ results }: InsightsViewProps) {
    const { state, dispatch } = useAppContext();
    const hasData = results.topDomains.length > 0 || results.ageAnalysis.length > 0;
    const { analysisResults } = state;

    const handleSelectInsight = (type: 'domain' | 'age', key: string) => {
        dispatch({ type: 'FILTER_BY_INSIGHT', payload: { type, key } });
    };

    if (!hasData) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-16">
                <ChartIcon className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Insights Generated</h2>
                <p>Could not analyze the bookmarks. The file might be empty or in an unexpected format.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-700 pb-2">
                <h2 className="text-2xl font-bold text-white">
                    {analysisResults?.folderTitle ? `Insights for: ${analysisResults.folderTitle}` : 'Global Bookmark Insights'}
                </h2>
                <p className="text-slate-400">Discover patterns in your collection. Click any item to view and manage the related bookmarks.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <InsightCard title="Top 10 Domains" icon={<DuplicateIcon className="w-5 h-5 text-indigo-400" />}>
                    {results.topDomains.map(({ domain, count }) => (
                        <InsightRow key={domain} label={domain} value={count} onClick={() => handleSelectInsight('domain', domain)} />
                    ))}
                </InsightCard>

                <InsightCard title="Bookmark Age Analysis" icon={<MagicIcon className="w-5 h-5 text-indigo-400" />}>
                     {results.ageAnalysis.map(({ label, bookmarks }) => (
                        <InsightRow key={label} label={label} value={bookmarks.length} onClick={() => handleSelectInsight('age', label)} />
                    ))}
                </InsightCard>
            </div>
        </div>
    );
}