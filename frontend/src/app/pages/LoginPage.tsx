import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Fingerprint, Lock, Activity, ShieldCheck, Cpu,
  Hospital, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'biometric' | 'password'>('biometric');
  const navigate = useNavigate();

  const handleBiometricLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1800);
  };

  const handleOAuthLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F7F9FC' }}>
      {/* ── Left Panel: Branding ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0C1B33 0%, #1E3A5F 55%, #0F3460 100%)' }}
      >
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2.5 rounded-xl">
              <Activity className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Jeevan</span>
          </div>
          <p className="text-blue-200 text-sm ml-1 font-medium tracking-wide uppercase">
            AI-assisted Early Sepsis Detection
          </p>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-4xl font-semibold leading-snug mb-3">
              ICU intelligence<br />
              <span className="text-blue-300">when it matters most.</span>
            </h2>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm">
              Real-time sepsis risk monitoring, AI-powered clinical decision support,
              and seamless ICU workflow integration.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, label: 'HIPAA & HL7 FHIR Compliant' },
              { icon: Cpu,         label: 'AI Risk Prediction Engine' },
              { icon: Hospital,    label: 'Multi-Ward Patient Monitoring' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-lg">
                  <Icon className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-blue-100 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live system status bar */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-blue-700/50"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="animate-live-dot h-2 w-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-blue-200 text-xs">All systems operational — 6 patients monitored</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Card ────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-slate-900 text-xl font-bold">Jeevan</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm">Sign in to your clinical dashboard</p>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setLoginMode('biometric')}
                className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${
                  loginMode === 'biometric'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Biometric
              </button>
              <button
                onClick={() => setLoginMode('password')}
                className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${
                  loginMode === 'password'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Password / SSO
              </button>
            </div>

            {loginMode === 'biometric' ? (
              <div className="space-y-6">
                {/* Biometric button with pulse rings */}
                <div className="flex flex-col items-center py-4">
                  <div className="relative flex items-center justify-center mb-5">
                    {/* Outer pulse rings */}
                    <span
                      className="absolute inline-flex h-32 w-32 rounded-full bg-blue-400 opacity-10 animate-ping"
                      style={{ animationDuration: '2.4s' }}
                    />
                    <span
                      className="absolute inline-flex h-24 w-24 rounded-full bg-blue-400 opacity-15 animate-ping"
                      style={{ animationDuration: '2s', animationDelay: '0.3s' }}
                    />

                    {/* Core button */}
                    <button
                      onClick={handleBiometricLogin}
                      disabled={isLoading}
                      className="animate-bio-pulse relative z-10 h-20 w-20 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                      <Fingerprint
                        className={`h-9 w-9 text-white ${isLoading ? 'opacity-60' : ''}`}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>

                  <p className="text-slate-700 font-medium text-sm mb-1">
                    {isLoading ? 'Authenticating…' : 'Touch to authenticate'}
                  </p>
                  <p className="text-slate-400 text-xs">Fingerprint or Face ID</p>
                </div>

                {/* SSO button */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center mb-3">Or sign in via institution</p>
                  <Button
                    onClick={handleOAuthLogin}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-11 justify-between text-slate-700 border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-slate-500" />
                      Hospital SSO
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Doctor ID / Email
                  </label>
                  <Input
                    type="email"
                    placeholder="dr.smith@hospital.org"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                <Button
                  onClick={handleOAuthLogin}
                  disabled={isLoading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </Button>

                <div className="pt-2 border-t border-slate-100">
                  <Button
                    onClick={handleOAuthLogin}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-11 justify-between text-slate-700 border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-slate-500" />
                      Continue with Hospital SSO
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
              </div>
            )}

            {/* Compliance footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs text-slate-400">
                Encrypted session · RBAC enforced · All access is audit-logged
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
