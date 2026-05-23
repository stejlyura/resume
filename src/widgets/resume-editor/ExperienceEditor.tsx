import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Briefcase, GripVertical, ChevronDown, ChevronUp, Plus, Trash2, EyeOff, Calendar } from 'lucide-react';
import { useResumeStore } from '@/features/resume-store/store';
import { SortableExperienceList, SortableExperienceItem } from '@/features/experience-dnd';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/utils';
import type { ExperienceItem } from '@/entities/resume/types';

// Sub-component for individual Experience Item form
interface ExperienceItemFormProps {
  item: ExperienceItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  dragHandleProps: any;
}

function ExperienceItemForm({ item, isExpanded, onToggleExpand, dragHandleProps }: ExperienceItemFormProps) {
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const removeExperience = useResumeStore((state) => state.removeExperience);

  const { register, watch, reset, setValue } = useForm<ExperienceItem>({
    defaultValues: item,
  });

  const company = watch('company');
  const position = watch('position');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const description = watch('description');
  const isVisible = watch('isVisible');

  // Reset form when branch/item changes in store
  useEffect(() => {
    reset(item);
  }, [item, reset]);

  // Debounced update to store
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasChanged =
        company !== item.company ||
        position !== item.position ||
        startDate !== item.startDate ||
        endDate !== item.endDate ||
        description !== item.description ||
        isVisible !== item.isVisible;

      if (hasChanged) {
        updateExperience(item.id, {
          company: company || '',
          position: position || '',
          startDate: startDate || '',
          endDate: endDate || '',
          description: description || '',
          isVisible: isVisible !== undefined ? isVisible : true,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [company, position, startDate, endDate, description, isVisible, item, updateExperience]);

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm transition-all duration-200">
      {/* Accordion Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-4 bg-muted/20 select-none cursor-pointer hover:bg-muted/40 transition-colors",
          !isVisible && "opacity-75"
        )}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0" onClick={(e) => e.stopPropagation()}>
          {/* Drag Handle */}
          <div 
            {...dragHandleProps}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            title="Перетащить для изменения порядка"
          >
            <GripVertical className="h-4.5 w-4.5" />
          </div>

          <div className="flex flex-col min-w-0 cursor-pointer" onClick={onToggleExpand}>
            <span className="font-semibold text-sm truncate">
              {position || 'Должность'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {company || 'Организация'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Status Indicators */}
          {!isVisible && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              <EyeOff className="h-3 w-3 shrink-0" />
              Скрыт
            </Badge>
          )}

          {startDate && (
            <span className="text-xs text-muted-foreground hidden sm:inline flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {startDate} — {endDate || 'н.в.'}
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => removeExperience(item.id)}
            title="Удалить место работы"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onToggleExpand}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Accordion Body */}
      {isExpanded && (
        <CardContent className="p-5 border-t border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id={`company-${item.id}`}
              label="Компания / Организация"
              placeholder="Например, Яндекс"
              {...register('company')}
            />

            <Input
              id={`position-${item.id}`}
              label="Должность"
              placeholder="Например, Frontend Developer"
              {...register('position')}
            />

            <Input
              id={`startDate-${item.id}`}
              label="Дата начала"
              placeholder="Например, Март 2023"
              {...register('startDate')}
            />

            <Input
              id={`endDate-${item.id}`}
              label="Дата окончания"
              placeholder="Например, По настоящее время"
              {...register('endDate')}
            />

            <div className="md:col-span-2">
              <Textarea
                id={`description-${item.id}`}
                label="Обязанности и достижения"
                placeholder="Опишите ваши ключевые проекты, стек технологий и результаты работы..."
                className="min-h-[120px]"
                {...register('description')}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Поддерживается Markdown-разметка: <code className="font-mono">**жирный**</code>, <code className="font-mono">*курсив*</code>
              </p>
            </div>

            {/* Premium Toggle Switch for Visibility */}
            <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/10">
              <div className="space-y-0.5 pr-4">
                <label className="text-sm font-semibold text-foreground block">
                  Отображать в резюме
                </label>
                <span className="text-xs text-muted-foreground">
                  Если выключено, этот блок опыта не попадет в экспортируемый PDF-файл.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setValue('isVisible', !isVisible, { shouldDirty: true })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isVisible ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out",
                    isVisible ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </CardContent>
      )}
    </div>
  );
}

export function ExperienceEditor() {
  const activeBranchId = useResumeStore((state) => state.activeBranchId);
  const experience = useResumeStore((state) => state.branches[state.activeBranchId]?.data.experience || []);
  const addExperience = useResumeStore((state) => state.addExperience);

  // Keep track of accordion expansion states
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Auto-expand the newly added experience item
  const prevLengthRef = useRef(experience.length);
  useEffect(() => {
    if (experience.length > prevLengthRef.current) {
      const newItem = experience[experience.length - 1];
      if (newItem) {
        setExpandedIds((prev) => ({
          ...prev,
          [newItem.id]: true,
        }));
      }
    }
    prevLengthRef.current = experience.length;
  }, [experience]);

  // Handle branch changes - expand the first item by default, collapse others
  useEffect(() => {
    if (experience.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      experience.forEach((item, index) => {
        initialExpanded[item.id] = index === 0; // expand first item
      });
      setExpandedIds(initialExpanded);
    } else {
      setExpandedIds({});
    }
  }, [activeBranchId]);

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Опыт работы
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Добавьте места работы и перетаскивайте их для изменения порядка
          </p>
        </div>
        <Button
          onClick={addExperience}
          size="sm"
          className="text-xs gap-1"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </CardHeader>
      
      <CardContent>
        {experience.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <Briefcase className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Опыт работы еще не добавлен</p>
            <p className="text-xs text-muted-foreground/75 mt-1 mb-4">Нажмите кнопку, чтобы добавить первое место работы</p>
            <Button
              variant="outline"
              onClick={addExperience}
              size="sm"
              className="text-xs gap-1"
            >
              <Plus className="h-4 w-4" />
              Добавить место работы
            </Button>
          </div>
        ) : (
          <SortableExperienceList items={experience}>
            <div className="space-y-3">
              {experience.map((item) => (
                <SortableExperienceItem key={item.id} id={item.id}>
                  {({ ref, style, dragHandleProps }) => (
                    <div ref={ref} style={style}>
                      <ExperienceItemForm
                        item={item}
                        isExpanded={!!expandedIds[item.id]}
                        onToggleExpand={() => toggleExpand(item.id)}
                        dragHandleProps={dragHandleProps}
                      />
                    </div>
                  )}
                </SortableExperienceItem>
              ))}
            </div>
          </SortableExperienceList>
        )}
      </CardContent>
    </Card>
  );
}
