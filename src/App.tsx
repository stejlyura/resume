import { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import {
  GitBranch,
  FileText,
  Sun,
  Moon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Lock,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

import { useResumeStore, createEmptyResumeData, getApiUrl } from '@/features/resume-store/store';
import {
  HeaderEditor,
  SummaryEditor,
  ExperienceEditor,
  MetadataEditor
} from '@/widgets/resume-editor';
import { BranchTreeVisualizer } from '@/widgets/branch-visualizer';
import { ResumePDFDocument, DownloadPDFButton } from '@/features/pdf-export';
import { cn } from '@/shared/lib/utils';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse-subtle" />

      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center p-4 rounded-3xl bg-card border border-border shadow-xl">
          <GitBranch className="h-10 w-10 text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-3xl border border-primary/30 animate-ping opacity-25" />
        </div>
        <h2 className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent font-extrabold text-2xl tracking-tight leading-none">
          GitResume
        </h2>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Проверка авторизации...</p>
      </div>
    </div>
  );
}

function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('resume_auth_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Неверное имя пользователя или пароль');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка сети. Убедитесь, что сервер запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient blur spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      {/* Glassmorphic login card */}
      <div className="w-full max-w-md bg-card/65 backdrop-blur-md border border-border/80 rounded-3xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300 hover:border-primary/30">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center mb-3">
            <GitBranch className="h-6 w-6" />
          </div>
          <h2 className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent font-extrabold text-2xl tracking-tight leading-none">
            GitResume
          </h2>
          <span className="text-xs text-muted-foreground mt-1.5 font-medium">
            Панель управления резюме
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-6 text-center">Авторизация</h3>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground/80 tracking-wide block uppercase" htmlFor="login">
              Имя пользователя
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите имя пользователя"
                required
                className="w-full bg-secondary/50 border border-border/60 hover:border-border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground/80 tracking-wide block uppercase" htmlFor="password">
              Пароль
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                className="w-full bg-secondary/50 border border-border/60 hover:border-border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all duration-300 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Войти</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('resume_auth_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const response = await fetch(getApiUrl('/api/auth/verify'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('resume_auth_token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  const { activeBranchId, branches, saveStatus, initializeState } = useResumeStore();
  const activeBranch = branches[activeBranchId];

  // Tab State: 'editor' | 'git' | 'pdf'
  const [activeTab, setActiveTab] = useState<'editor' | 'git' | 'pdf'>('editor');

  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Handle Theme application
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initial Data Fetching from MongoDB Atlas via API
  useEffect(() => {
    if (!isAuthenticated) return;

    const defaultState = {
      branches: {
        main: {
          id: 'main',
          name: 'main',
          parentId: null,
          data: createEmptyResumeData(),
          createdAt: Date.now(),
        }
      },
      activeBranchId: 'main'
    };

    const syncDefaultState = async () => {
      try {
        const token = localStorage.getItem('resume_auth_token');
        useResumeStore.getState().setSaveStatus('saving');
        const response = await fetch(getApiUrl('/api/resume'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            branches: defaultState.branches,
            activeBranchId: defaultState.activeBranchId,
          }),
        });
        if (response.ok) {
          useResumeStore.getState().setSaveStatus('saved');
        } else {
          useResumeStore.getState().setSaveStatus('error');
        }
      } catch (err) {
        console.error('Failed to sync initial state to server:', err);
        useResumeStore.getState().setSaveStatus('error');
      }
    };

    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('resume_auth_token');
        const response = await fetch(getApiUrl('/api/resume'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.branches && Object.keys(data.branches).length > 0 && data.activeBranchId) {
            initializeState(data);
          } else {
            // Server returned ok but empty/invalid structure
            initializeState(defaultState);
            await syncDefaultState();
          }
        } else {
          // Server error (e.g. 500 or 401)
          if (response.status === 401) {
            localStorage.removeItem('resume_auth_token');
            setIsAuthenticated(false);
          }
          initializeState(defaultState);
          useResumeStore.getState().setSaveStatus('error');
        }
      } catch (error) {
        console.error('Failed to fetch initial resume data:', error);
        initializeState(defaultState);
        useResumeStore.getState().setSaveStatus('error');
      }
    };

    fetchInitialData();
  }, [initializeState, isAuthenticated]);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (isAuthenticated === false) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-12 font-sans selection:bg-primary/20">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-md shadow-primary/10 flex items-center justify-center">
              <GitBranch className="h-5 w-5 animate-pulse-subtle" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent font-extrabold text-xl tracking-tight leading-none">
                GitResume
              </span>
              <span className="text-[10px] font-medium text-muted-foreground block leading-none mt-0.5">
                Version Controlled CV Builder
              </span>
            </div>
          </div>

          {/* Controls: Branch Info, Auto-Save Status, Theme Toggler */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Active Branch Display */}
            {activeBranch && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                <GitBranch className="h-3.5 w-3.5" />
                <span>Ветка: {activeBranch.name}</span>
              </div>
            )}

            {/* Auto-Save Indicator */}
            <div className="transition-all duration-300">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full animate-pulse border border-amber-500/20">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="hidden xs:inline">Сохранение...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden xs:inline">Сохранено в облако</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                  <AlertCircle className="h-3 w-3" />
                  <span className="hidden xs:inline">Ошибка сохранения</span>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-background"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 transition-all duration-300" />
              ) : (
                <Sun className="h-4 w-4 transition-all duration-300" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('resume_auth_token');
                setIsAuthenticated(false);
              }}
              className="p-2 rounded-xl border border-border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-muted-foreground transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:ring-offset-1 focus:ring-offset-background"
              title="Выйти"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs for Mobile View (< lg) */}
        <div className="flex lg:hidden bg-card border border-border/80 p-1.5 rounded-xl mb-6 shadow-sm gap-1.5">
          <button
            onClick={() => setActiveTab('editor')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200",
              activeTab === 'editor'
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Edit3 className="h-4 w-4" />
            Редактор
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200",
              activeTab === 'git'
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <GitBranch className="h-4 w-4" />
            Ветки (Git)
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200",
              activeTab === 'pdf'
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Eye className="h-4 w-4" />
            Превью PDF
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Editors and Branch Tree Visualizer */}
          <div className={cn(
            "lg:col-span-7 space-y-6",
            activeTab === 'pdf' ? 'hidden lg:block' : 'block'
          )}>
            
            {/* Navigation Tabs for Desktop View (>= lg) */}
            <div className="hidden lg:flex bg-card border border-border/80 p-1 rounded-xl shadow-sm gap-1 max-w-[340px]">
              <button
                onClick={() => setActiveTab('editor')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200",
                  (activeTab === 'editor' || activeTab === 'pdf')
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Edit3 className="h-4 w-4" />
                Редактор резюме
              </button>
              <button
                onClick={() => setActiveTab('git')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-200",
                  activeTab === 'git'
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <GitBranch className="h-4 w-4" />
                Дерево версий
              </button>
            </div>

            {/* Left Column Content Switcher */}
            {(activeTab === 'editor' || activeTab === 'pdf') ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <MetadataEditor />
                <HeaderEditor />
                <SummaryEditor />
                <ExperienceEditor />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <BranchTreeVisualizer />
              </div>
            )}
          </div>

          {/* Right Panel: Interactive PDF Preview */}
          <div className={cn(
            "lg:col-span-5 space-y-6 lg:sticky lg:top-24",
            activeTab !== 'pdf' ? 'hidden lg:block' : 'block'
          )}>
            
            {/* Interactive Preview Card Container */}
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300">
              
              {/* PDF Header with Controls */}
              <div className="p-4 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">Предпросмотр резюме</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={activeBranch ? `${activeBranch.data.metadata.fileTitle || 'Resume'}.pdf` : ''}>
                      {activeBranch ? `${activeBranch.data.metadata.fileTitle || 'Resume'}.pdf` : 'Инициализация...'}
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto min-w-[140px]">
                  <DownloadPDFButton />
                </div>
              </div>

              {/* PDF Rendering Body */}
              <div className="relative aspect-[1/1.414] lg:h-[calc(100vh-14.5rem)] min-h-[480px] w-full overflow-hidden bg-muted/20 flex items-center justify-center">
                {activeBranch ? (
                  <PDFViewer className="w-full h-full border-0" showToolbar={false}>
                    <ResumePDFDocument data={activeBranch.data} />
                  </PDFViewer>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">Загрузка данных...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
