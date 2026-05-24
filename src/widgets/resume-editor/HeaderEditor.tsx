import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import { useResumeStore } from '@/features/resume-store/store';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import type { ResumeHeader } from '@/entities/resume/types';

export function HeaderEditor() {
  const activeBranchId = useResumeStore((state) => state.activeBranchId);
  const activeHeader = useResumeStore((state) => state.branches[state.activeBranchId]?.data.header);
  const updateHeader = useResumeStore((state) => state.updateHeader);

  // Initialize react-hook-form
  const { register, reset, watch } = useForm<ResumeHeader>({
    defaultValues: activeHeader || {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      telegram: '',
      github: '',
      linkedin: '',
      website: '',
    },
  });

  // Watch fields individually to trigger debounced update
  const fullName = watch('fullName');
  const title = watch('title');
  const email = watch('email');
  const phone = watch('phone');
  const telegram = watch('telegram');
  const github = watch('github');
  const linkedin = watch('linkedin');
  const website = watch('website');

  // Reset form values when active branch changes
  useEffect(() => {
    if (activeHeader) {
      reset(activeHeader);
    }
  }, [activeBranchId, reset]);

  // Debounced update to Zustand store
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeHeader) {
        const hasChanged =
          fullName !== activeHeader.fullName ||
          title !== activeHeader.title ||
          email !== activeHeader.email ||
          phone !== activeHeader.phone ||
          telegram !== activeHeader.telegram ||
          github !== activeHeader.github ||
          linkedin !== activeHeader.linkedin ||
          website !== activeHeader.website;

        if (hasChanged) {
          updateHeader({
            fullName: fullName || '',
            title: title || '',
            email: email || '',
            phone: phone || '',
            telegram: telegram || '',
            github: github || '',
            linkedin: linkedin || '',
            website: website || '',
          });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fullName, title, email, phone, telegram, github, linkedin, website, updateHeader, activeHeader]);

  return (
    <Card className="w-full border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Личные данные
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Заполните контактную информацию для шапки вашего резюме
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2">
            <Input
              id="fullName"
              label="ФИО / Полное имя"
              placeholder="Иван Иванов"
              className="pl-3"
              {...register('fullName')}
            />
          </div>

          {/* Job Title */}
          <div className="md:col-span-2">
            <Input
              id="title"
              label="Желаемая должность"
              placeholder="Frontend Developer"
              className="pl-3"
              {...register('title')}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              id="email"
              type="email"
              label="Эл. почта"
              placeholder="ivan@example.com"
              className="pl-3"
              {...register('email')}
            />
          </div>

          {/* Phone */}
          <div>
            <Input
              id="phone"
              type="tel"
              label="Номер телефона"
              placeholder="+7 (999) 123-45-67"
              className="pl-3"
              {...register('phone')}
            />
          </div>

          {/* Telegram */}
          <div>
            <Input
              id="telegram"
              label="Telegram (username или ссылка)"
              placeholder="@ivan_developer"
              className="pl-3"
              {...register('telegram')}
            />
          </div>

          {/* GitHub */}
          <div>
            <Input
              id="github"
              label="GitHub (username или ссылка)"
              placeholder="github.com/ivan"
              className="pl-3"
              {...register('github')}
            />
          </div>

          {/* Website */}
          <div>
            <Input
              id="website"
              label="Личный сайт / Портфолио"
              placeholder="https://ivan.dev"
              className="pl-3"
              {...register('website')}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <Input
              id="linkedin"
              label="LinkedIn (username или ссылка)"
              placeholder="linkedin.com/in/ivan"
              className="pl-3"
              {...register('linkedin')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
