import React from 'react';
import { BookmarkIcon, TrashIcon } from './icons';
import { useAppContext } from '../AppContext';
import { DuplicateSet } from '../types';

interface DuplicateManagerViewProps {
  duplicates: DuplicateSet[];
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return 'N/A';
  const date = new Date(parseInt(timestamp) * 1000);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
}

export function DuplicateManagerView({ duplicates }: DuplicateManagerViewProps) {
  const { dispatch } = useAppContext();

  const handleResolve = (group: DuplicateSet, strategy: 'keep_oldest' | 'keep_newest' | 'delete_all') => {
      const idsToRemove = new Set<string>();
      const sortedItems = [...group.items].sort((a,b) => parseInt(a.bookmark.addDate || '0') - parseInt(b.bookmark.addDate || '0'));
      
      switch (strategy) {
          case 'keep_oldest':
              sortedItems.slice(1).forEach(item => idsToRemove.add(item.bookmark.id));
              break;
          case 'keep_newest':
              sortedItems.slice(0, -1).forEach(item => idsToRemove.add(item.bookmark.id));
              break;
          case 'delete_all':
              sortedItems.forEach(item => idsToRemove.add(item.bookmark.id));
              break;
      }
      
      if (idsToRemove.size > 0) {
        dispatch({ type: 'SHOW_CONFIRMATION', payload: {
          title: "Confirm Deletion",
          message: `Are you sure you want to delete ${idsToRemove.size} bookmark(s)? This action cannot be undone.`,
          onConfirm: () => dispatch({ type: 'RESOLVE_DUPLICATES', payload: { idsToRemove, urlToRemove: group.url } })
        }});
      }
  };

  if (duplicates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-16">
        <BookmarkIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No More Duplicates</h2>
        <p>All duplicate bookmarks have been resolved!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-700 pb-2">
        <h2 className="text-2xl font-bold text-white">
          {duplicates.length} {duplicates.length === 1 ? 'Duplicate Set' : 'Duplicate Sets'} Found
        </h2>
        <p className="text-slate-400">Review each set of duplicate bookmarks and choose an action.</p>
      </div>
      {duplicates.map((group) => (
        <div key={group.url} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <div className="border-b border-slate-600 pb-3 mb-3">
             <h3 className="text-base font-semibold text-slate-200 mb-1">{group.items.length} Duplicates Found</h3>
            <p className="text-sm text-slate-400">URL</p>
            <a href={group.url} target="_blank" rel="noopener noreferrer" className="font-mono text-indigo-400 hover:underline break-all">{group.url}</a>
          </div>
          <div className="space-y-3 mb-4">
            {group.items.map(({ bookmark, path }) => (
              <div key={bookmark.id} className="grid grid-cols-12 gap-4 text-sm p-2 rounded-md bg-slate-800">
                <div className="col-span-4 overflow-hidden">
                  <p className="text-slate-400 text-xs">Title</p>
                  <p className="truncate font-medium text-white">{bookmark.title}</p>
                </div>
                 <div className="col-span-4 overflow-hidden">
                  <p className="text-slate-400 text-xs">Folder Path</p>
                  <p className="truncate text-slate-300">{path || 'Bookmarks Bar'}</p>
                </div>
                <div className="col-span-4">
                  <p className="text-slate-400 text-xs">Date Added</p>
                  <p className="text-slate-300">{formatTimestamp(bookmark.addDate)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button onClick={() => handleResolve(group, 'keep_oldest')} className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">Keep Oldest</button>
            <button onClick={() => handleResolve(group, 'keep_newest')} className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">Keep Newest</button>
            <button onClick={() => handleResolve(group, 'delete_all')} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded-md flex items-center space-x-2 transition-colors">
                <TrashIcon className="w-3 h-3 mr-1" />
                Delete All Copies
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}