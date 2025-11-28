
export type Screen = 'dashboard' | 'tasks' | 'focus' | 'rewards' | 'stats';

export type Quadrant = 'do' | 'schedule' | 'delegate' | 'eliminate' | 'inbox';

export type TimeOfDay = 'morning' | 'afternoon' | 'night';

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    quadrant: Quadrant;
    subtasks?: Subtask[];
    dueDate?: string; // YYYY-MM-DD
    completedAt?: string; // ISO Date String
    timeOfDay?: TimeOfDay;
    tagId?: number | null;
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
    pomodoroEstimate?: number;
    customDuration?: number; // Duração personalizada em minutos (opcional)
    energyNeeded?: EnergyLevel;
    displayOrder?: number;
    isDetailed?: boolean;
}

export interface TaskFilters {
    tags: number[];
    status: ('overdue' | 'frog')[];
    energy: EnergyLevel[];
}


export interface Tag {
    id: number;
    name: string;
    color: string;
}

export interface Notification {
    id: number;
    message: string;
    icon: string;
    action?: {
        label: string;
        onAction: () => void;
    };
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    isDefault?: boolean;
}

export interface TaskTemplate {
    id: number;
    title: string;
    description?: string;
    quadrant?: Quadrant;
    pomodoroEstimate?: number;
    customDuration?: number;
    energyNeeded?: EnergyLevel;
    category: string;
    subtasks?: Omit<Subtask, 'id' | 'completed'>[];
}

export interface Routine {
    id: string;
    name: string;
    description: string;
    icon: string;
    taskTemplateIds: number[];
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    type: 'theme' | 'sound' | 'icon';
    cost: number;
}
