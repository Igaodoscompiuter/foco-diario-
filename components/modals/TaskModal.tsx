
import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task, Subtask, Quadrant, TimeOfDay, EnergyLevel } from '../../types';
import { quadrants } from '../../constants';
import styles from './TaskModal.module.css'; // Módulo de estilo para componentes internos

// --- Helper Functions e Constantes ---

const getInitialTaskState = (taskToEdit: Partial<Task> | null): Partial<Task> => {
    if (taskToEdit && Object.keys(taskToEdit).length > 0) {
        return { ...taskToEdit, subtasks: taskToEdit.subtasks ? [...taskToEdit.subtasks] : [], pomodoroEstimate: taskToEdit.pomodoroEstimate !== undefined ? taskToEdit.pomodoroEstimate : 1 };
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return { title: '', description: '', quadrant: 'inbox', subtasks: [], status: 'todo', pomodoroEstimate: 1, energyNeeded: 'medium', dueDate: `${yyyy}-${mm}-${dd}` };
};

const energyLevels: { id: EnergyLevel, label: string, icon: keyof typeof icons }[] = [
    { id: 'low', label: 'Baixa', icon: 'batteryLow' },
    { id: 'medium', label: 'Média', icon: 'batteryMedium' },
    { id: 'high', label: 'Alta', icon: 'batteryHigh' },
];

const timeOfDayOptions: { id: TimeOfDay | '', label: string }[] = [
    { id: 'morning', label: 'Manhã' },
    { id: 'afternoon', label: 'Tarde' },
    { id: 'night', label: 'Noite' },
    { id: '', label: 'Nenhum' },
];

// --- Componente Principal ---

export const TaskModal: React.FC<{ taskToEdit: Partial<Task> | null; onClose: () => void; }> = ({ taskToEdit, onClose }) => {
    const { handleAddTask, handleUpdateTask, handleDeleteTask, handleCreateTemplateFromTask } = useTasks();
    const [task, setTask] = useState<Partial<Task>>({});
    const [newSubtask, setNewSubtask] = useState('');
    const [isDetailedView, setIsDetailedView] = useState(false);

    const isQuickTask = task.pomodoroEstimate === 0;

    useEffect(() => {
        const initialState = getInitialTaskState(taskToEdit);
        setTask(initialState);
        setIsDetailedView(!!initialState.id || !!initialState.isDetailed);
    }, [taskToEdit]);

    const handleChange = (field: keyof Task, value: any) => setTask(prev => ({ ...prev, [field]: value }));
    const handleTaskTypeChange = (type: 'focus' | 'quick') => {
        handleChange('pomodoroEstimate', type === 'quick' ? 0 : 1);
        if (type === 'quick') handleChange('customDuration', undefined);
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const subtask: Subtask = { id: `sub-${Date.now()}`, text: newSubtask, completed: false };
            handleChange('subtasks', [...(task.subtasks || []), subtask]);
            setNewSubtask('');
        }
    };
    const handleRemoveSubtask = (id: string) => handleChange('subtasks', task.subtasks?.filter(st => st.id !== id));

    const handleSubmit = () => {
        if (!task.title?.trim()) return alert('O título da tarefa é obrigatório.');
        const { isDetailed, ...taskToSave } = task;
        if (taskToSave.id) handleUpdateTask(taskToSave as Task);
        else handleAddTask(taskToSave as Omit<Task, 'id' | 'status'>);
        onClose();
    };

    const handleDelete = () => {
        if (task.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            handleDeleteTask(task.id);
            onClose();
        }
    };

    if (!taskToEdit) return null;

    return (
        <div className="g-modal-overlay" onClick={onClose}>
            <div className="g-modal" onClick={e => e.stopPropagation()}>
                <header className="g-modal-header">
                    <h3><Icon path={icons.edit3} /> {task.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                    <button onClick={onClose} className="btn btn-secondary btn-icon"><Icon path={icons.close} /></button>
                </header>

                <main className="g-modal-body">
                    <input
                        type="text"
                        className={styles.titleInput}
                        placeholder="O que precisa ser feito?"
                        value={task.title || ''}
                        onChange={e => handleChange('title', e.target.value)}
                        autoFocus
                    />

                    {!isDetailedView ? (
                        <button className={styles.addDetailsButton} onClick={() => setIsDetailedView(true)}>
                            <Icon path={icons.plusCircle} /> Adicionar Detalhes
                        </button>
                    ) : (
                        <div className={styles.detailedFields}>
                            <textarea
                                className={styles.descriptionTextarea}
                                placeholder="Descrição, links, notas..."
                                value={task.description || ''}
                                onChange={e => handleChange('description', e.target.value)}
                            />
                            
                            <MatrixSelector task={task} setTask={setTask} />

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label><Icon path={icons.calendar} /> Data</label>
                                    <input type="date" className={styles.formInput} value={task.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label><Icon path={icons.sun} /> Período</label>
                                    <div className={styles.buttonSelector}>
                                        {timeOfDayOptions.map(opt => (
                                            <button key={opt.id} className={task.timeOfDay === opt.id ? styles.selected : ''} onClick={() => handleChange('timeOfDay', opt.id)}>{opt.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label><Icon path={icons.target} /> Tipo de Tarefa</label>
                                <div className={styles.buttonSelector}>
                                    <button className={!isQuickTask ? styles.selected : ''} onClick={() => handleTaskTypeChange('focus')}>Foco (Timer)</button>
                                    <button className={isQuickTask ? styles.selected : ''} onClick={() => handleTaskTypeChange('quick')}>Rápida (Check)</button>
                                </div>
                            </div>

                            {!isQuickTask && (
                                <div className={styles.grid}>
                                    <div className={styles.formGroup}>
                                        <label><Icon path={icons.timer} /> Pomodoros (25min)</label>
                                        <input type="number" className={styles.formInput} value={task.pomodoroEstimate || ''} onChange={e => handleChange('pomodoroEstimate', parseInt(e.target.value) || 1)} min="1" placeholder="1" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label><Icon path={icons.clock} /> Duração Custom. (min)</label>
                                        <input type="number" className={styles.formInput} value={task.customDuration || ''} onChange={e => handleChange('customDuration', e.target.value ? parseInt(e.target.value) : undefined)} min="1" placeholder="25" />
                                    </div>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label><Icon path={icons.battery} /> Energia Necessária</label>
                                <div className={styles.buttonSelector}>
                                    {energyLevels.map(level => (
                                        <button key={level.id} className={task.energyNeeded === level.id ? styles.selected : ''} onClick={() => handleChange('energyNeeded', level.id)}>
                                            <Icon path={level.icon} /> {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label><Icon path={icons.checkSquare} /> Subtarefas</label>
                                <ul className={styles.subtaskList}>
                                    {task.subtasks?.map(sub => (
                                        <li key={sub.id} className={styles.subtaskItem}>
                                            <input type="checkbox" checked={sub.completed} readOnly className="task-complete-button"/>
                                            <input type="text" value={sub.text} onChange={e => handleChange('subtasks', task.subtasks?.map(s => s.id === sub.id ? {...s, text: e.target.value} : s))} className={styles.subtaskInput}/>
                                            <button onClick={() => handleRemoveSubtask(sub.id)} className="btn btn-tertiary btn-icon btn-sm"><Icon path={icons.trash}/></button>
                                        </li>
                                    ))}
                                </ul>
                                <div className={styles.subtaskAddGroup}>
                                    <input type="text" placeholder="Adicionar subtarefa..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddSubtask()} />
                                    <button onClick={handleAddSubtask} className="btn btn-primary btn-icon btn-sm"><Icon path={icons.plus}/></button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="g-modal-footer">
                    <div style={{ marginRight: 'auto' }}> 
                        {task.id && <button className="btn btn-tertiary btn-danger" onClick={handleDelete}><Icon path={icons.trash} /> Excluir</button>}
                        {task.id && <button className="btn btn-tertiary" onClick={() => handleCreateTemplateFromTask(task as Task)}><Icon path={icons.bookOpen} /> Salvar como Modelo</button>}
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={handleSubmit}><Icon path={icons.check} /> Salvar</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// --- Sub-componente para a Matriz (continua o mesmo) ---

const MatrixSelector: React.FC<{ task: Partial<Task>, setTask: React.Dispatch<React.SetStateAction<Partial<Task>>> }> = ({ task, setTask }) => {
    const [urgency, setUrgency] = useState<'urgent' | 'not-urgent' | null>(null);
    const [importance, setImportance] = useState<'important' | 'not-important' | null>(null);
    
    const currentQuadrantInfo = quadrants.find(q => q.id === task.quadrant) || { title: 'Caixa de Entrada', subtitle: 'Defina a prioridade', icon: 'inbox' as keyof typeof icons, id: 'inbox' };

    useEffect(() => {
        const q = task.quadrant;
        if (q === 'do') { setUrgency('urgent'); setImportance('important'); } 
        else if (q === 'schedule') { setUrgency('not-urgent'); setImportance('important'); } 
        else if (q === 'delegate') { setUrgency('urgent'); setImportance('not-important'); } 
        else if (q === 'eliminate') { setUrgency('not-urgent'); setImportance('not-important'); } 
        else { setUrgency(null); setImportance(null); }
    }, [task.quadrant]);

    const updateMatrix = (u: typeof urgency, i: typeof importance) => {
        setUrgency(u); setImportance(i);
        if (u && i) {
             let newQ: Quadrant = 'inbox';
             if (u === 'urgent' && i === 'important') newQ = 'do';
             if (u === 'not-urgent' && i === 'important') newQ = 'schedule';
             if (u === 'urgent' && i === 'not-important') newQ = 'delegate';
             if (u === 'not-urgent' && i === 'not-important') newQ = 'eliminate';
             setTask(prev => ({ ...prev, quadrant: newQ }));
        }
    };

    return (
        <div className={styles.formGroup}>
            <label><Icon path={icons.layoutGrid} /> Matriz de Prioridade</label>
            <div className={styles.matrixSelectorContainer}>
                <div className={styles.matrixRow}>
                    <span className={styles.matrixLabel}>É urgente?</span>
                    <div className={styles.matrixToggleGroup}>
                        <button className={`${styles.matrixToggleBtn} ${urgency === 'not-urgent' ? styles.active : ''}`} onClick={() => updateMatrix('not-urgent', importance)}>Pode esperar</button>
                        <button className={`${styles.matrixToggleBtn} ${urgency === 'urgent' ? styles.active : ''}`} onClick={() => updateMatrix('urgent', importance)}>É pra já!</button>
                    </div>
                </div>
                <div className={styles.matrixRow}>
                    <span className={styles.matrixLabel}>É importante?</span>
                    <div className={styles.matrixToggleGroup}>
                        <button className={`${styles.matrixToggleBtn} ${importance === 'not-important' ? styles.active : ''}`} onClick={() => updateMatrix(urgency, 'not-important')}>Baixo impacto</button>
                        <button className={`${styles.matrixToggleBtn} ${importance === 'important' ? styles.active : ''}`} onClick={() => updateMatrix(urgency, 'important')}>Alto impacto</button>
                    </div>
                </div>
                <div className={`${styles.matrixResult} ${styles[`quadrant-${currentQuadrantInfo.id}`]}`}>
                    <div className={styles.resultIcon}><Icon path={icons[currentQuadrantInfo.icon]} /></div>
                    <div className={styles.resultText}>
                        <span className={styles.resultTitle}>{currentQuadrantInfo.title}</span>
                        <span className={styles.resultSubtitle}>{currentQuadrantInfo.subtitle}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
