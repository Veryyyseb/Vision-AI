import { Bell, Search } from 'lucide-react';
import type { ActiveView } from '../types';

const TITLES: Record<ActiveView, string> = {
  dashboard: 'Dashboard',
  analyze: 'Analyze Image',
  history: 'Analysis History',
  settings: 'Settings',
};

const SUBTITLES: Record<ActiveView, string> = {
  dashboard: 'Overview of your Vision AI activity',
  analyze: 'Upload an image to detect objects',
  history: 'Browse your past analyses',
  settings: 'Configure your preferences',
};

interface HeaderProps {
  activeView: ActiveView;
}

export default function Header({ activeView }: HeaderProps) {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6">
      <div className="ml-10 lg:ml-0">
        <h1 className="text-lg font-semibold text-white leading-none">{TITLES[activeView]}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{SUBTITLES[activeView]}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 border border-gray-700 w-52">
          <Search className="w-3.5 h-3.5" />
          <span>Search…</span>
        </div>
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-semibold text-white">
          VA
        </div>
      </div>
    </header>
  );
}
