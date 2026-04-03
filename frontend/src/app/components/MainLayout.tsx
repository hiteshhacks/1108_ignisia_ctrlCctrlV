import { Outlet, useNavigate, useLocation } from 'react-router';
import { Activity, Bell, LogOut, Users, FileText, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertPanel } from './AlertPanel';
import { useState } from 'react';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAlerts, setShowAlerts] = useState(false);
  const alertCount = 3;
  const criticalCount = 1;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-6 py-0 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Jeevan</span>
              <span className="text-slate-400 text-xs ml-1.5 hidden sm:inline">ICU Monitoring</span>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 ml-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
              <span className="animate-live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </div>
          </div>

          {/* Nav + Actions */}
          <div className="flex items-center gap-1">
            {/* Nav buttons */}
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors font-medium ${
                isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Ward View</span>
            </button>

            <button
              onClick={() => navigate('/handover')}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors font-medium ${
                isActive('/handover') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Handover</span>
            </button>

            {/* Alerts */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors font-medium relative ${
                  showAlerts ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Alerts</span>
                {alertCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                    {alertCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Doctor info */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                SJ
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-slate-900 leading-none">Dr. Sarah Johnson</p>
                <p className="text-xs text-slate-400 mt-0.5">ICU Ward A</p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
            </button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-slate-700 h-8 w-8 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Critical banner (only when critical alerts exist) */}
      {criticalCount > 0 && !showAlerts && (
        <div className="bg-red-600 text-white text-xs font-medium text-center py-1.5 flex items-center justify-center gap-2 flex-shrink-0">
          <span className="animate-live-dot h-1.5 w-1.5 rounded-full bg-red-200" />
          {criticalCount} Critical Alert Active — P001 John Miller
          <button
            onClick={() => setShowAlerts(true)}
            className="underline underline-offset-2 hover:text-red-100 ml-1"
          >
            View →
          </button>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* Alert side panel */}
        {showAlerts && (
          <aside className="w-96 border-l border-slate-200 bg-white shadow-lg flex-shrink-0">
            <AlertPanel onClose={() => setShowAlerts(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}
