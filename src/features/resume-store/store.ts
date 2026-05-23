import { create } from 'zustand';
import type {
  ResumeState,
  ResumeHeader,
  ExperienceItem,
  ResumeMetadata,
  ResumeBranch,
  ResumeData
} from '@/entities/resume/types';


export interface ResumeStore extends ResumeState {
  // Actions for editing active branch data
  updateHeader: (fields: Partial<ResumeHeader>) => void;
  updateSummary: (text: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, fields: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;
  updateMetadata: (fields: Partial<ResumeMetadata>) => void;

  // Actions for Git-like branching
  createBranch: (name: string, parentId: string) => void;
  checkoutBranch: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  mergeBranch: (sourceBranchId: string, targetBranchId: string) => void;

  // Actions for initialization & status
  initializeState: (state: Partial<ResumeState>) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'error') => void;
}

export const createEmptyResumeData = (): ResumeData => ({
  header: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    telegram: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  metadata: {
    fileTitle: 'Resume',
    atsSkills: [],
  },
});

const initialBranchId = 'main';
const initialBranch: ResumeBranch = {
  id: initialBranchId,
  name: 'main',
  parentId: null,
  data: createEmptyResumeData(),
  createdAt: Date.now(),
};

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial State
  branches: {
    [initialBranchId]: initialBranch,
  },
  activeBranchId: initialBranchId,
  saveStatus: 'saved',

  // Actions for editing active branch data
  updateHeader: (fields) =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          header: {
            ...activeBranch.data.header,
            ...fields,
          },
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  updateSummary: (text) =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          summary: text,
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  addExperience: () =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const newExperience: ExperienceItem = {
        id: crypto.randomUUID(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        isVisible: true,
      };

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          experience: [...activeBranch.data.experience, newExperience],
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  updateExperience: (id, fields) =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const updatedExperience = activeBranch.data.experience.map((item) =>
        item.id === id ? { ...item, ...fields } : item
      );

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          experience: updatedExperience,
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  removeExperience: (id) =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const updatedExperience = activeBranch.data.experience.filter((item) => item.id !== id);

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          experience: updatedExperience,
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  reorderExperience: (startIndex, endIndex) =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const list = [...activeBranch.data.experience];
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          experience: list,
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  updateMetadata: (fields) =>
    set((state) => {
      const activeBranch = state.branches[state.activeBranchId];
      if (!activeBranch) return {};

      const updatedBranch = {
        ...activeBranch,
        data: {
          ...activeBranch.data,
          metadata: {
            ...activeBranch.data.metadata,
            ...fields,
          },
        },
      };

      return {
        branches: {
          ...state.branches,
          [state.activeBranchId]: updatedBranch,
        },
        saveStatus: 'saving',
      };
    }),

  // Actions for Git-like branching
  createBranch: (name, parentId) =>
    set((state) => {
      const parentBranch = state.branches[parentId];
      if (!parentBranch) return {};

      const newBranchId = crypto.randomUUID();
      const newBranch: ResumeBranch = {
        id: newBranchId,
        name,
        parentId,
        data: JSON.parse(JSON.stringify(parentBranch.data)),
        createdAt: Date.now(),
      };

      return {
        branches: {
          ...state.branches,
          [newBranchId]: newBranch,
        },
        activeBranchId: newBranchId,
        saveStatus: 'saving',
      };
    }),

  checkoutBranch: (branchId) =>
    set((state) => {
      if (!state.branches[branchId]) return {};
      return {
        activeBranchId: branchId,
      };
    }),

  deleteBranch: (branchId) =>
    set((state) => {
      if (branchId === 'main') return {};

      const branchKeys = Object.keys(state.branches);
      if (branchKeys.length <= 1) return {};

      const updatedBranches = { ...state.branches };
      delete updatedBranches[branchId];

      let nextActiveId = state.activeBranchId;
      if (state.activeBranchId === branchId) {
        nextActiveId = updatedBranches['main'] ? 'main' : Object.keys(updatedBranches)[0];
      }

      return {
        branches: updatedBranches,
        activeBranchId: nextActiveId,
        saveStatus: 'saving',
      };
    }),

  mergeBranch: (sourceBranchId, targetBranchId) =>
    set((state) => {
      const sourceBranch = state.branches[sourceBranchId];
      const targetBranch = state.branches[targetBranchId];
      if (!sourceBranch || !targetBranch) return {};

      const updatedTargetBranch = {
        ...targetBranch,
        data: JSON.parse(JSON.stringify(sourceBranch.data)),
      };

      return {
        branches: {
          ...state.branches,
          [targetBranchId]: updatedTargetBranch,
        },
        saveStatus: 'saving',
      };
    }),

  // Actions for initialization & status
  initializeState: (newState) =>
    set((state) => {
      const branches = newState.branches && Object.keys(newState.branches).length > 0
        ? newState.branches
        : state.branches;
      const activeBranchId = newState.activeBranchId && branches[newState.activeBranchId]
        ? newState.activeBranchId
        : Object.keys(branches)[0];

      return {
        branches,
        activeBranchId,
        saveStatus: newState.saveStatus || 'saved',
      };
    }),

  setSaveStatus: (status) => set({ saveStatus: status }),
}));

// Auto-save synchronization with MongoDB Atlas via Express backend
const API_URL = 'http://localhost:3001/api/resume';

const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const saveToServer = debounce(async (state: { branches: any; activeBranchId: string }) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branches: state.branches,
        activeBranchId: state.activeBranchId,
      }),
    });

    if (response.ok) {
      useResumeStore.getState().setSaveStatus('saved');
    } else {
      useResumeStore.getState().setSaveStatus('error');
    }
  } catch (error) {
    console.error('Failed to auto-save resume to MongoDB:', error);
    useResumeStore.getState().setSaveStatus('error');
  }
}, 1000);

useResumeStore.subscribe((state, prevState) => {
  const dataChanged =
    state.branches !== prevState.branches ||
    state.activeBranchId !== prevState.activeBranchId;

  if (dataChanged && state.saveStatus === 'saving') {
    saveToServer({
      branches: state.branches,
      activeBranchId: state.activeBranchId,
    });
  }
});

