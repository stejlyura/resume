import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Info } from 'lucide-react';
import { useResumeStore } from '@/features/resume-store/store';
import { Textarea } from '@/shared/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';

interface SummaryFormInput {
  summary: string;
}

export function SummaryEditor() {
  const activeBranchId = useResumeStore((state) => state.activeBranchId);
  const activeSummary = useResumeStore((state) => state.branches[state.activeBranchId]?.data.summary);
  const updateSummary = useResumeStore((state) => state.updateSummary);

  const { register, reset, watch } = useForm<SummaryFormInput>({
    defaultValues: {
      summary: activeSummary || '',
    },
  });

  const summaryValue = watch('summary');

  // Reset form when active branch changes
  useEffect(() => {
    reset({ summary: activeSummary || '' });
  }, [activeBranchId, reset, activeSummary]);

  // Debounced update to Zustand store
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeSummary !== undefined && summaryValue !== activeSummary) {
        updateSummary(summaryValue || '');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [summaryValue, updateSummary, activeSummary]);

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          О себе (Summary)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Краткое описание вашего профессионального опыта, ключевых навыков и карьерных целей
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          id="summary"
          placeholder="Напишите краткую сводку о ваших достижениях и опыте..."
          className="min-h-[160px] pl-3 resize-y leading-relaxed"
          {...register('summary')}
        />

        {/* Markdown Hints Banner */}
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
          <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Поддерживается Markdown-разметка:</p>
            <ul className="list-disc pl-4 space-y-1 mt-1 text-muted-foreground/90">
              <li>
                Используйте <code className="px-1.5 py-0.5 rounded bg-background border border-border font-mono font-bold text-foreground">**текст**</code> для выделения <strong>жирным</strong>.
              </li>
              <li>
                Используйте <code className="px-1.5 py-0.5 rounded bg-background border border-border font-mono italic text-foreground">*текст*</code> для выделения <em>курсивом</em>.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
