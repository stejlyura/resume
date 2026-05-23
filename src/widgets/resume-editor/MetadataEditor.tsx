import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, Tag, Info } from 'lucide-react';
import { useResumeStore } from '@/features/resume-store/store';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';

interface MetadataFormInput {
  fileTitle: string;
}

export function MetadataEditor() {
  const activeBranchId = useResumeStore((state) => state.activeBranchId);
  const metadata = useResumeStore((state) => state.branches[state.activeBranchId]?.data.metadata);
  const updateMetadata = useResumeStore((state) => state.updateMetadata);

  const [skillInput, setSkillInput] = useState('');

  const { register, reset, watch } = useForm<MetadataFormInput>({
    defaultValues: {
      fileTitle: metadata?.fileTitle || 'Resume',
    },
  });

  const fileTitle = watch('fileTitle');

  // Reset form when branch changes
  useEffect(() => {
    reset({ fileTitle: metadata?.fileTitle || 'Resume' });
  }, [activeBranchId, reset, metadata?.fileTitle]);

  // Debounced update for fileTitle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (metadata && fileTitle !== metadata.fileTitle) {
        updateMetadata({ fileTitle: fileTitle || 'Resume' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fileTitle, updateMetadata, metadata?.fileTitle]);

  // Key handler for skills input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillInput.trim().replace(/,$/, '');
      if (trimmed && metadata) {
        const currentSkills = metadata.atsSkills || [];
        if (!currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
          updateMetadata({
            atsSkills: [...currentSkills, trimmed],
          });
        }
        setSkillInput('');
      }
    }
  };

  const handleAddSkillClick = () => {
    const trimmed = skillInput.trim();
    if (trimmed && metadata) {
      const currentSkills = metadata.atsSkills || [];
      if (!currentSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        updateMetadata({
          atsSkills: [...currentSkills, trimmed],
        });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (metadata) {
      updateMetadata({
        atsSkills: metadata.atsSkills.filter((s) => s !== skillToRemove),
      });
    }
  };

  const currentSkills = metadata?.atsSkills || [];

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Настройки документа и ATS
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Настройте имя скачиваемого файла и ключевые слова для поисковых систем резюме
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* PDF File Title */}
        <div className="space-y-1.5">
          <Input
            id="fileTitle"
            label="Имя скачиваемого PDF-файла"
            placeholder="например, Resume_Frontend_Ivanov"
            helperText="Файл будет сохранен с этим именем при нажатии на кнопку экспорта."
            className="pl-3"
            {...register('fileTitle')}
          />
        </div>

        {/* ATS Skills */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Ключевые навыки (ATS Keywords)
            </label>
            <p className="text-xs text-muted-foreground">
              Добавьте технические навыки, языки и технологии, по которым рекрутеры будут искать ваше резюме
            </p>
          </div>

          <div className="flex gap-2">
            <input
              id="skill-input"
              type="text"
              placeholder="например, React, TypeScript, GraphQL..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:border-muted-foreground/30 focus-visible:border-primary transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleAddSkillClick}
              className="h-10 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
            >
              Добавить
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 bg-muted/40 p-2.5 rounded-lg border border-border/40">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Нажмите <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[9px]">Enter</kbd> или запятую <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[9px]">,</kbd> чтобы добавить навык в список.</span>
          </p>

          {/* Render Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {currentSkills.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-1">Ключевые навыки еще не добавлены</p>
            ) : (
              currentSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  onRemove={() => handleRemoveSkill(skill)}
                  className="py-1 px-3 text-xs"
                >
                  <Tag className="h-3 w-3 text-primary shrink-0" />
                  {skill}
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default MetadataEditor;
