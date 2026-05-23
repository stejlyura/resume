import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GitBranch, GitMerge, Trash2, Check, Plus, AlertTriangle } from 'lucide-react';
import { useResumeStore } from '@/features/resume-store/store';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/utils';

interface TreeNode {
  id: string;
  name: string;
  createdAt: number;
  parentId: string | null;
  children: TreeNode[];
}

interface ConnectorLine {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export function BranchTreeVisualizer() {
  const {
    branches,
    activeBranchId,
    createBranch,
    checkoutBranch,
    deleteBranch,
    mergeBranch,
  } = useResumeStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<ConnectorLine[]>([]);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [createError, setCreateError] = useState('');

  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [mergeError, setMergeError] = useState('');

  // 1. Build hierarchical tree from parentId relations
  const treeRoots = useMemo(() => {
    const nodesMap: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    // Initialize map with all branches
    Object.values(branches).forEach((branch) => {
      nodesMap[branch.id] = {
        id: branch.id,
        name: branch.name,
        createdAt: branch.createdAt,
        parentId: branch.parentId,
        children: [],
      };
    });

    // Establish parent-child links
    Object.values(nodesMap).forEach((node) => {
      if (node.parentId && nodesMap[node.parentId]) {
        nodesMap[node.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children by creation date to keep layout consistent
    const sortTree = (node: TreeNode) => {
      node.children.sort((a, b) => a.createdAt - b.createdAt);
      node.children.forEach(sortTree);
    };
    roots.forEach(sortTree);

    return roots;
  }, [branches]);

  // 2. Draw SVG lines between parent and child elements
  const updateLines = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLines: ConnectorLine[] = [];

    Object.values(branches).forEach((branch) => {
      if (branch.parentId) {
        const parentEl = container.querySelector(`[data-node-id="${branch.parentId}"]`);
        const childEl = container.querySelector(`[data-node-id="${branch.id}"]`);

        if (parentEl && childEl) {
          const parentRect = parentEl.getBoundingClientRect();
          const childRect = childEl.getBoundingClientRect();

          // Calculate relative positions, adjusting for scroll offset
          const fromX = parentRect.left - containerRect.left + container.scrollLeft + parentRect.width / 2;
          const fromY = parentRect.bottom - containerRect.top + container.scrollTop;
          
          const toX = childRect.left - containerRect.left + container.scrollLeft + childRect.width / 2;
          const toY = childRect.top - containerRect.top + container.scrollTop;

          newLines.push({
            id: `${branch.parentId}-${branch.id}`,
            from: { x: fromX, y: fromY },
            to: { x: toX, y: toY },
          });
        }
      }
    });

    setLines(newLines);
  };

  // 3. Keep lines updated on window resize/layout changes
  useEffect(() => {
    updateLines();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateLines);
    
    // Set up a resize observer on the container and all cards for precise updates
    const container = containerRef.current;
    if (!container) return () => window.removeEventListener('resize', updateLines);

    const observer = new ResizeObserver(() => {
      updateLines();
    });
    
    observer.observe(container);
    
    // Observe cards
    const cards = container.querySelectorAll('[data-node-id]');
    cards.forEach((card) => observer.observe(card));

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateLines);
      observer.disconnect();
    };
  }, [branches, activeBranchId, treeRoots]);

  // Extra helper to make sure lines update after initial render transitions
  useEffect(() => {
    const timer = setTimeout(updateLines, 150);
    return () => clearTimeout(timer);
  }, [branches, activeBranchId]);

  // Handler for opening Branch Creation Modal
  const handleOpenCreateModal = (parentId: string) => {
    setCreateParentId(parentId);
    setNewBranchName('');
    setCreateError('');
    setCreateModalOpen(true);
  };

  // Handler for creating branch
  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createParentId) return;

    const trimmedName = newBranchName.trim();
    if (!trimmedName) {
      setCreateError('Имя ветки не может быть пустым');
      return;
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = Object.values(branches).some(
      (b) => b.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setCreateError('Ветка с таким именем уже существует');
      return;
    }

    createBranch(trimmedName, createParentId);
    setCreateModalOpen(false);
  };

  // Handler for opening Merge Modal
  const handleOpenMergeModal = (sourceId: string) => {
    setMergeSourceId(sourceId);
    setMergeTargetId('');
    setMergeError('');
    setMergeModalOpen(true);
  };

  // Handler for merging branch
  const handleMergeBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId) return;

    if (mergeSourceId === mergeTargetId) {
      setMergeError('Нельзя объединить ветку саму с собой');
      return;
    }

    mergeBranch(mergeSourceId, mergeTargetId);
    setMergeModalOpen(false);
  };

  // Formatter for dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render a branch node card
  const renderCard = (node: TreeNode) => {
    const isActive = activeBranchId === node.id;
    const isMain = node.name === 'main';
    const totalBranches = Object.keys(branches).length;
    const canDelete = !isMain && totalBranches > 1;

    return (
      <div
        data-node-id={node.id}
        className={cn(
          "w-72 bg-card border rounded-xl shadow-sm transition-all duration-300 relative z-10 flex flex-col hover:shadow-md",
          isActive
            ? "border-primary ring-2 ring-primary/20 shadow-primary/5"
            : "border-border"
        )}
      >
        {/* Active Branch Status Glow line */}
        {isActive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-xl" />
        )}

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 max-w-[70%]">
                <GitBranch className={cn("h-4 w-4 shrink-0", isActive ? "text-primary animate-pulse-subtle" : "text-muted-foreground")} />
                <span className="font-semibold text-sm truncate" title={node.name}>
                  {node.name}
                </span>
              </div>
              {isActive && (
                <Badge variant="default" className="text-[10px] px-2 py-0">
                  Активная
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Создана: {formatDate(node.createdAt)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
            <Button
              variant={isActive ? "primary" : "outline"}
              size="sm"
              className="text-xs w-full py-1 h-8"
              onClick={() => checkoutBranch(node.id)}
              disabled={isActive}
            >
              {isActive ? (
                <>
                  <Check className="h-3 w-3 shrink-0" />
                  Выбрана
                </>
              ) : (
                'Checkout'
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs w-full py-1 h-8"
              onClick={() => handleOpenCreateModal(node.id)}
            >
              <Plus className="h-3 w-3 shrink-0" />
              Branch
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs w-full py-1 h-8"
              onClick={() => handleOpenMergeModal(node.id)}
            >
              <GitMerge className="h-3 w-3 shrink-0" />
              Merge
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full py-1 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => deleteBranch(node.id)}
              disabled={!canDelete}
              title={isMain ? "Нельзя удалить ветку main" : undefined}
            >
              <Trash2 className="h-3 w-3 shrink-0" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Recursively render the tree layout
  const renderTreeNode = (node: TreeNode) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        {renderCard(node)}
        {node.children.length > 0 && (
          <div className="flex gap-16 mt-16 relative">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-background rounded-xl border border-border overflow-hidden">
      {/* Visualizer Header */}
      <div className="p-4 border-b border-border bg-card flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Дерево версий резюме
          </h2>
          <p className="text-xs text-muted-foreground">
            Создавайте ветки, переключайтесь между ними и объединяйте изменения
          </p>
        </div>
      </div>

      {/* Tree Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-12 relative min-h-[500px]"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* SVG overlay to render smooth bezier lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          {lines.map((line) => {
            // Draw a smooth bezier curve between the nodes
            const midY = (line.from.y + line.to.y) / 2;
            const pathData = `M ${line.from.x} ${line.from.y} 
                              C ${line.from.x} ${midY}, 
                                ${line.to.x} ${midY}, 
                                ${line.to.x} ${line.to.y}`;
            return (
              <path
                key={line.id}
                d={pathData}
                fill="none"
                stroke="hsl(var(--primary) / 0.4)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Tree Root wrapper */}
        <div className="flex justify-center items-start min-w-max h-full relative">
          {treeRoots.map(renderTreeNode)}
        </div>
      </div>

      {/* ================= MODAL: CREATE BRANCH ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-card border border-border shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Создать новую ветку
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateBranch}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="branch-name" className="text-sm font-medium text-foreground">
                    Имя ветки
                  </label>
                  <input
                    id="branch-name"
                    type="text"
                    placeholder="например, en-version, short-version"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={newBranchName}
                    onChange={(e) => {
                      setNewBranchName(e.target.value);
                      if (createError) setCreateError('');
                    }}
                    autoFocus
                  />
                  {createError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {createError}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border border-border/50">
                  Будет создана точная копия данных родительской ветки{' '}
                  <strong className="text-foreground">
                    "{branches[createParentId || '']?.name}"
                  </strong>
                  . Все будущие изменения в новой ветке не повлияют на родительскую.
                </p>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-6 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">
                  Создать ветку
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ================= MODAL: MERGE BRANCH ================= */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-card border border-border shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="h-5 w-5 text-primary" />
                Слияние веток
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleMergeBranch}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="target-branch" className="text-sm font-medium text-foreground">
                    Выберите целевую ветку
                  </label>
                  <select
                    id="target-branch"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={mergeTargetId}
                    onChange={(e) => {
                      setMergeTargetId(e.target.value);
                      if (mergeError) setMergeError('');
                    }}
                    required
                  >
                    <option value="" disabled>-- Выберите ветку для слияния --</option>
                    {Object.values(branches)
                      .filter((b) => b.id !== mergeSourceId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                  {mergeError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {mergeError}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">Внимание! Данное действие необратимо.</p>
                    <p>
                      Все данные в выбранной целевой ветке будут полностью заменены данными из ветки{' '}
                      <strong>"{branches[mergeSourceId || '']?.name}"</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-6 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMergeModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!mergeTargetId}
                >
                  Выполнить слияние
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
