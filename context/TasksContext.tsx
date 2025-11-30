
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Task, Tag, Quadrant, TaskTemplate, Routine, ChecklistItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { initialRoutines, initialTaskTemplates } from '../constants';

const generateUniqueId = () => {
    return crypto.randomUUID();
};

interface TasksContextType {
    tasks: Task[];
    tags: Tag[];
    frogTaskId: string | null;
    routines: Routine[];
    taskTemplates: TaskTemplate[];
    handleAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
    handleUpdateTask: (updatedTask: Task) => void;
    handleUpdateTaskQuadrant: (taskId: string, newQuadrant: Quadrant, newIndex: number) => void;
    handleDeleteTask: (taskId: string) => void;
    handleCompleteTask: (taskId: string, subtaskId?: string) => void;
    handleToggleSubtask: (taskId: string, subtaskId: string) => void;
    setFrogTaskId: (id: string | null) => void;
    handleUnsetFrog: () => void;
    handleSaveTag: (tag: Partial<Tag>) => void;
    handleDeleteTag: (tagId: number) => void;
    handlePostponeTask: (taskId: string, days: number) => void;
    needsMorningPlan: boolean;
    needsOverdueReview: boolean;
    overdueTasksForReview: Task[];
    handleSetFrogFromReview: (taskId: string) => void;
    handleReviewAction: (action: 'complete' | 'postpone' | 'remove_date', taskId: string) => void;
    handlePostponeAllOverdue: (taskIds: string[]) => Promise<void>;
    clearOverdueReview: () => void;
    handleCreateTemplateFromTask: (task: Task) => void;
    leavingHomeItems: ChecklistItem[];
    handleToggleLeavingHomeItem: (itemId: string) => void;
    handleAddLeavingHomeItem: (text: string) => void;
    handleRemoveLeavingHomeItem: (itemId: string) => void;
    handleResetLeavingHomeItems: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};

const defaultLeavingHomeItems: ChecklistItem[] = [
    { id: 'item-1', text: 'Chaves', completed: false, isDefault: true },
    { id: 'item-2', text: 'Carteira', completed: false, isDefault: true },
    { id: 'item-3', text: 'Celular', completed: false, isDefault: true },
]

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addNotification } = useUI();
    const { setPontosFoco } = useTheme();

    const [tasks, setTasks] = useLocalStorage<Task[]>('focusfrog_tasks', []);
    const [tags, setTags] = useLocalStorage<Tag[]>('focusfrog_tags', [{ id: 1, name: 'Trabalho', color: '#3B82F6' }]);
    const [frogTaskId, setFrogTaskId] = useLocalStorage<string | null>('focusfrog_frogTaskId', null);
    
    const routines = initialRoutines;
    const [taskTemplates, setTaskTemplates] = useLocalStorage<TaskTemplate[]>('focusfrog_taskTemplates', initialTaskTemplates);

    const [leavingHomeItems, setLeavingHomeItems] = useLocalStorage<ChecklistItem[]>('focusfrog_leavingHomeItems', defaultLeavingHomeItems);
    const [lastOpenedDate, setLastOpenedDate] = useLocalStorage('focusfrog_lastOpenedDate', '');
    const [overdueTasksForReview, setOverdueTasksForReview] = useState<Task[]>([]);
    const [needsOverdueReview, setNeedsOverdueReview] = useState(false);
    
    const getLocalTodayString = useCallback(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const todayString = useMemo(() => getLocalTodayString(), [getLocalTodayString]);
    
    useEffect(() => {
        if (lastOpenedDate !== todayString) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const overdue = tasks.filter(t => {
                if (!t.dueDate || t.status === 'done') return false;
                const taskDate = new Date(t.dueDate + 'T00:00:00');
                return taskDate < yesterday;
            });

            if (overdue.length > 0) {
                setOverdueTasksForReview(overdue);
                setNeedsOverdueReview(true);
            }
            
            setLastOpenedDate(todayString);
        }
    }, [tasks, lastOpenedDate, todayString, setLastOpenedDate]);
    
    const needsMorningPlan = useMemo(() => {
        const frogForToday = tasks.find(t => t.id === frogTaskId && t.dueDate === todayString);
        return !frogForToday;
    }, [tasks, frogTaskId, todayString]);

    const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'status'>) => {
        setTasks(prevTasks => {
            const newTask: Task = {
                ...taskData,
                id: generateUniqueId(),
                status: 'todo',
                displayOrder: prevTasks.filter(t => t.quadrant === taskData.quadrant).length,
            };
            return [...prevTasks, newTask];
        });
        // A notificação de adição será tratada na UI para mais contexto
    }, [setTasks]);

    const handleUpdateTask = useCallback((updatedTask: Task) => {
        setTasks(prevTasks => {
            return prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
        });
        addNotification('Tarefa atualizada!', '✏️', 'success');
    }, [setTasks, addNotification]);

    const handleUpdateTaskQuadrant = useCallback((taskId: string, newQuadrant: Quadrant, newIndex: number) => {
        setTasks(prevTasks => {
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove) return prevTasks;
    
            const oldQuadrant = taskToMove.quadrant;
    
            const tasksWithoutMoved = prevTasks.filter(t => t.id !== taskId);
            
            const updatedTask = { ...taskToMove, quadrant: newQuadrant };
            
            const newQuadrantTasks = tasksWithoutMoved.filter(t => t.quadrant === newQuadrant);
            newQuadrantTasks.splice(newIndex, 0, updatedTask);

            const updatedNewQuadrantTasks = newQuadrantTasks.map((t, index) => ({ ...t, displayOrder: index }));

            const updatedOldQuadrantTasks = tasksWithoutMoved
                .filter(t => t.quadrant === oldQuadrant)
                .map((t, index) => ({ ...t, displayOrder: index }));

            const unaffectedTasks = tasksWithoutMoved.filter(
                t => t.quadrant !== oldQuadrant && t.quadrant !== newQuadrant
            );
            
            return [...unaffectedTasks, ...updatedOldQuadrantTasks, ...updatedNewQuadrantTasks];
        });
    }, [setTasks]);

    const handleDeleteTask = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        addNotification('Tarefa excluída!', '🗑️', 'info');
    }, [setTasks, addNotification]);

    const handleCompleteTask = useCallback((taskId: string, subtaskId?: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                if (subtaskId) {
                    let subtaskJustCompleted = false;
                    const updatedSubtasks = task.subtasks?.map(st => {
                        if (st.id === subtaskId) {
                            if (!st.completed) subtaskJustCompleted = true;
                            return { ...st, completed: !st.completed };
                        }
                        return st;
                    }) || [];
                    
                    if (subtaskJustCompleted) {
                        setPontosFoco(p => p + 5);
                    }

                    const allSubtasksDone = updatedSubtasks.every(st => st.completed);
                    let newStatus = task.status;
                    
                    if (allSubtasksDone && updatedSubtasks.length > 0) {
                        if(task.status !== 'done') {
                            addNotification('Todas as subtarefas concluídas!', '🎉', 'victory');
                            setPontosFoco(p => p + 10);
                        }
                        newStatus = 'done';
                    } else if (task.status === 'done' && !allSubtasksDone) {
                        newStatus = 'todo';
                    }
                    
                    return { ...task, subtasks: updatedSubtasks, status: newStatus };
                }
                
                // Lógica para tarefa principal
                const newStatus = task.status === 'done' ? 'todo' : 'done';
                if (newStatus === 'done') {
                    if (taskId === frogTaskId) {
                        addNotification('Você engoliu o sapo! Conquista épica!', '🐸👑', 'victory');
                        setPontosFoco(p => p + 25); 
                    } else {
                        addNotification('Tarefa concluída!', '🎉', 'victory');
                        setPontosFoco(p => p + 10);
                    }
                }
                return { ...task, status: newStatus };
            }
            return task;
        }));
    }, [setTasks, addNotification, setPontosFoco, frogTaskId]);
    
    const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
        handleCompleteTask(taskId, subtaskId);
    }, [handleCompleteTask]);

    const handleSaveTag = useCallback((tag: Partial<Tag>) => {
        setTags(prev => {
            if (tag.id) {
                return prev.map(t => t.id === tag.id ? { ...t, ...tag } : t);
            }
            const newTag: Tag = { id: Date.now(), name: tag.name!, color: tag.color! };
            return [...prev, newTag];
        });
    }, [setTags]);

    const handleDeleteTag = useCallback((tagId: number) => {
        setTags(prev => prev.filter(t => t.id !== tagId));
        setTasks(prev => prev.map(t => t.tagId === tagId ? { ...t, tagId: null } : t));
    }, [setTags, setTasks]);
    
    const handlePostponeTask = useCallback((taskId: string, days: number) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                const currentDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : new Date();
                currentDate.setDate(currentDate.getDate() + days);
                const newDueDate = currentDate.toISOString().split('T')[0];
                return { ...task, dueDate: newDueDate };
            }
            return task;
        }));
        addNotification(`Tarefa adiada por ${days} dia(s)!`, '🗓️', 'info');
    }, [setTasks, addNotification]);

    const handleCreateTemplateFromTask = useCallback((task: Task) => {
        const newTemplate: TaskTemplate = {
            id: Date.now(), 
            title: task.title,
            description: task.description,
            quadrant: task.quadrant,
            pomodoroEstimate: task.pomodoroEstimate,
            customDuration: task.customDuration,
            energyNeeded: task.energyNeeded,
            category: 'Personalizado',
            subtasks: task.subtasks?.map(st => ({ text: st.text })),
        };
        setTaskTemplates(prev => [...prev, newTemplate]);
        addNotification("Modelo salvo na biblioteca!", '📚', 'info');
    }, [setTaskTemplates, addNotification]);
    
    const handleAddLeavingHomeItem = (text: string) => {
        setLeavingHomeItems(prev => [...prev, { id: generateUniqueId(), text, completed: false, isDefault: false }]);
    };

    const handleToggleLeavingHomeItem = (itemId: string) => {
        setLeavingHomeItems(prev => prev.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item));
    };
    const handleRemoveLeavingHomeItem = (itemId: string) => {
        setLeavingHomeItems(prev => prev.filter(item => item.id !== itemId));
    };
    const handleResetLeavingHomeItems = () => {
        setLeavingHomeItems(prev => prev.map(item => ({ ...item, completed: false })));
    };
    const clearOverdueReview = () => {
        setNeedsOverdueReview(false);
        setOverdueTasksForReview([]);
    };
    const handleSetFrogFromReview = (taskId: string) => {
        setFrogTaskId(taskId);
        const task = tasks.find(t => t.id === taskId);
        if (task && !task.dueDate) {
            handleUpdateTask({ ...task, dueDate: todayString });
        }
    };

    const handleUnsetFrog = useCallback(() => {
        setFrogTaskId(null);
        addNotification("Sapo desmarcado.", "🐸", 'info');
    }, [setFrogTaskId, addNotification]);

    const handleReviewAction = (action: 'complete' | 'postpone' | 'remove_date', taskId: string) => {
        setOverdueTasksForReview(prev => prev.filter(t => t.id !== taskId));
        switch (action) {
            case 'complete':
                handleCompleteTask(taskId);
                break;
            case 'postpone':
                handlePostponeTask(taskId, 1);
                break;
            case 'remove_date':
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate: undefined } : t));
                break;
        }
    };
    const handlePostponeAllOverdue = async (taskIds: string[]) => {
        taskIds.forEach(id => handlePostponeTask(id, 1));
        clearOverdueReview();
    };

    const value: TasksContextType = {
        tasks,
        tags,
        frogTaskId,
        routines,
        taskTemplates,
        handleAddTask,
        handleUpdateTask,
        handleUpdateTaskQuadrant,
        handleDeleteTask,
        handleCompleteTask,
        handleToggleSubtask,
        setFrogTaskId,
        handleUnsetFrog,
        handleSaveTag,
        handleDeleteTag,
        handlePostponeTask,
        needsMorningPlan,
        needsOverdueReview,
        overdueTasksForReview,
        handleSetFrogFromReview,
        handleReviewAction,
        handlePostponeAllOverdue,
        clearOverdueReview,
        handleCreateTemplateFromTask,
        leavingHomeItems,
        handleToggleLeavingHomeItem,
        handleAddLeavingHomeItem,
        handleRemoveLeavingHomeItem,
        handleResetLeavingHomeItems,
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};