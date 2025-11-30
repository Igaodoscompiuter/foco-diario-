
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { TaskModal } from '../components/modals/TaskModal';
import { MorningReviewModal } from '../components/modals/MorningReviewModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task } from '../types';
import { LeavingHomeChecklist } from '../components/dashboard/LeavingHomeChecklist';
import { AgendaDeHoje } from '../components/dashboard/AgendaDeHoje';
import styles from './DashboardScreen.module.css';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Bom dia', icon: icons.sun, gradient: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' };
    if (hour < 18) return { text: 'Boa tarde', icon: icons.sun, gradient: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)' };
    return { text: 'Boa noite', icon: icons.moon, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
};

export const DashboardScreen: React.FC = () => {
    const { tasks, frogTaskId, setFrogTaskId, handleCompleteTask, handleAddTask, handleUnsetFrog, handleToggleLeavingHomeItem, leavingHomeItems, handleAddLeavingHomeItem, handleRemoveLeavingHomeItem, handleResetLeavingHomeItems } = useTasks();
    const { handleNavigate, addNotification } = useUI();
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [brainDumpText, setBrainDumpText] = useState('');
    const [isMorningReviewOpen, setIsMorningReviewOpen] = useState(false);
    
    const [selectedFrogId, setSelectedFrogId] = useState<string | null>(null);

    const greeting = getGreeting();
    const frogTask = useMemo(() => tasks.find(t => t.id === frogTaskId && t.status !== 'done'), [tasks, frogTaskId]);
    const eligibleFrogTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);

    const handleBrainDumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (brainDumpText.trim()) {
            handleAddTask({ title: brainDumpText, quadrant: 'inbox', pomodoroEstimate: 1, energyNeeded: 'medium' });
            setBrainDumpText('');
            addNotification('Enviado para Caixa de Entrada!', '📥', 'info');
        }
    };
    
    const handleFrogTaskClick = (task: Task) => {
        if (task.status === 'done') {
            handleCompleteTask(task.id);
            return;
        }
        handleNavigate('focus');
    };

    const handleConfirmFrog = () => {
        if (selectedFrogId) {
            setFrogTaskId(selectedFrogId);
            addNotification('Sapo do Dia definido!', '🐸', 'success');
            setIsMorningReviewOpen(false);
            setSelectedFrogId(null);
        }
    };

    return (
        <main>
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={() => setEditingTask(null)} />}
            
            <MorningReviewModal 
                isOpen={isMorningReviewOpen} 
                onClose={() => setIsMorningReviewOpen(false)}
                tasks={eligibleFrogTasks}       
                selectedTask={selectedFrogId}   
                onSelectTask={setSelectedFrogId}  
                onConfirm={handleConfirmFrog}   
            />
            
            <div className={styles.dashboardHeader} style={{ background: greeting.gradient }}>
                <div className={styles.greetingContent}>
                    <h2>{greeting.text}!</h2>
                    <p>Vamos fazer acontecer hoje?</p>
                </div>
            </div>

            <form onSubmit={handleBrainDumpSubmit} className={styles.brainDumpForm}>
                <input 
                    type="text" 
                    placeholder="O que está na sua mente? (Despejo Mental)"
                    value={brainDumpText}
                    onChange={(e) => setBrainDumpText(e.target.value)}
                />
                <button type="submit" disabled={!brainDumpText.trim()}>
                    <Icon path={icons.plus} />
                </button>
            </form>

            <div className={`${styles.frogCard} ${frogTask ? styles.hasFrog : ''}`}>
                <div className={styles.frogCardHeader}>
                    <h3><Icon path={icons.frog} /> Sapo do Dia</h3>
                    {frogTask && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-small" onClick={() => setIsMorningReviewOpen(true)}>
                                Alterar
                            </button>
                            <button className="btn btn-secondary btn-icon btn-small" onClick={handleUnsetFrog} title="Remover Sapo">
                                <Icon path={icons.close} />
                            </button>
                        </div>
                    )}
                </div>
                {frogTask ? (
                    <div>
                        <p className={styles.frogTaskTitle}>{frogTask.title}</p>
                        <button className="btn btn-primary" style={{width: '100%'}} onClick={() => handleFrogTaskClick(frogTask)}>
                            Comer o Sapo!
                        </button>
                    </div>
                ) : (
                    <div className={styles.frogCardContentEmpty} onClick={() => setIsMorningReviewOpen(true)}>
                        <Icon path={icons.target} size={24} />
                        <strong>Escolha seu Sapo!</strong>
                        <p>Selecione a tarefa que vai destravar seu dia.</p>
                    </div>
                )}
            </div>

            <LeavingHomeChecklist 
                items={leavingHomeItems}
                onToggleItem={handleToggleLeavingHomeItem}
                onAddItem={handleAddLeavingHomeItem}
                onRemoveItem={handleRemoveLeavingHomeItem}
                onResetItems={handleResetLeavingHomeItems}
            />

            <button 
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: 'var(--sp-lg)' }} 
                onClick={() => handleNavigate('tasks')}>
                <Icon path={icons.list} />
                Ver todas as tarefas
            </button>

            <AgendaDeHoje />

        </main>
    );
};