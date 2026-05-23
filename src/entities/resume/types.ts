export interface ResumeHeader {
  fullName: string;
  title: string; // желаемая должность
  email: string;
  phone: string;
  telegram: string;
  github: string;
  website: string;
}

export interface ExperienceItem {
  id: string; // uuid
  company: string;
  position: string;
  startDate: string;
  endDate: string; // или "По настоящее время"
  description: string; // текст с поддержкой Markdown
  isVisible: boolean; // флаг для скрытия блока в PDF
}

export interface ResumeMetadata {
  fileTitle: string; // имя файла при скачивании PDF, например "Resume_Ivanov_Frontend"
  atsSkills: string[]; // мета-теги/ключевые навыки для оптимизации под ATS
}

export interface ResumeData {
  header: ResumeHeader;
  summary: string; // краткое описание с поддержкой Markdown
  experience: ExperienceItem[];
  metadata: ResumeMetadata;
}

export interface ResumeBranch {
  id: string; // уникальный идентификатор ветки
  name: string; // название ветки, например "main", "dev-copy", "short-version"
  parentId: string | null; // id родительской ветки для отслеживания дерева
  data: ResumeData; // снапшот данных резюме на этой ветке
  createdAt: number; // таймстамп создания
}

export interface ResumeState {
  branches: Record<string, ResumeBranch>; // карта веток по их ID
  activeBranchId: string; // ID текущей активной ветки
  saveStatus: 'saved' | 'saving' | 'error'; // статус автосохранения
}

