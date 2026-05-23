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
  Edit3
} from 'lucide-react';

import { useResumeStore, createEmptyResumeData } from '@/features/resume-store/store';
import {
  HeaderEditor,
  SummaryEditor,
  ExperienceEditor,
  MetadataEditor
} from '@/widgets/resume-editor';
import { BranchTreeVisualizer } from '@/widgets/branch-visualizer';
import { ResumePDFDocument, DownloadPDFButton } from '@/features/pdf-export';
import { cn } from '@/shared/lib/utils';

export function App() {
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
        useResumeStore.getState().setSaveStatus('saving');
        const response = await fetch('http://localhost:3001/api/resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
        const response = await fetch('http://localhost:3001/api/resume');
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
          // Server error (e.g. 500)
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
  }, [initializeState]);

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
