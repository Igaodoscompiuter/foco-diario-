
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/modals/TaskModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task, Quadrant, TaskFilters } from '../types';
import { quadrants } from '../constants';
import { FilterPanel } from '../components/tasks/FilterPanel';
import { TaskLibraryModal } from '../components/modals/TaskLibraryModal';
import styles from './TasksScreen.module.css';

const QuadrantColumn: React.FC<any> = ({ quadrant, tasks, onEdit, onSubtaskClick, onToggleSubtask, draggingTask, onDragStart, onDragEnd, onDrop, isMaximized, onToggleMaximize }) => {
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const quadrantInfo = quadrants.find(q => q.id === quadrant) || { title: 'Caixa de Entrada', subtitle: 'Para Organizar', icon: 'inbox' as keyof typeof icons };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicatorIndex(index);
    setIsColumnDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropIndicatorIndex(null);
    setIsColumnDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, quadrant, index);
    setDropIndicatorIndex(null);
    setIsColumnDragOver(false);
  };
  
  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(e, quadrant, tasks.length);
    setDropIndicatorIndex(null);
    setIsColumnDragOver(false);
  }

  // FIX: Adicionada a classe global .card para padronizar a aparência das colunas.
  return (
    <div
      className={`card ${styles.quadrantColumn} ${styles['quadrant-' + quadrant]} ${isMaximized ? styles.maximized : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsColumnDragOver(true); }}
      onDragLeave={handleDragLeave}
      onDrop={handleColumnDrop}
    >
      <div className={styles.quadrantHeader}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Icon path={icons[quadrantInfo.icon]} />
            <div>
            <h4>{quadrantInfo.title}</h4>
            <p>{quadrantInfo.subtitle}</p>
            </div>
        </div>
        <button onClick={onToggleMaximize} className="btn btn-secondary btn-icon btn-small" title={isMaximized ? "Restaurar" : "Focar Quadrante"}>
            <Icon path={isMaximized ? icons.minimize : icons.maximize} />
        </button>
      </div>
      <div className={`${styles.taskList} ${isColumnDragOver && tasks.length === 0 ? styles.dragOver : ''}`}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={styles.dropZone}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className={`${styles.dropIndicator} ${dropIndicatorIndex === index ? styles.visible : ''}`}></div>
            <TaskCard
              task={task}
              onEdit={onEdit}
              onSubtaskClick={onSubtaskClick}
              onToggleSubtask={onToggleSubtask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingTask?.id === task.id}
            />
          </div>
        ))}
        <div 
          className={styles.dropZone}
          style={{ height: tasks.length > 0 ? '1rem' : '100%' }}
          onDragOver={(e) => handleDragOver(e, tasks.length)}
          onDrop={(e) => handleDrop(e, tasks.length)}
        >
          <div className={`${styles.dropIndicator} ${dropIndicatorIndex === tasks.length ? styles.visible : ''}`} style={{top: '4px'}}></div>
        </div>
        
        {tasks.length === 0 && (
           <div className={styles.emptyQuadrantDropzone} onDrop={handleColumnDrop}>
            <p>Vazio! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const TasksScreen: React.FC = () => {
    const { tasks, handleUpdateTaskQuadrant, handleToggleSubtask, routines, handleAddRoutine, handleAddTemplates } = useTasks();
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [filters, setFilters] = useState<TaskFilters>({ tags: [], status: [], energy: [] });
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);
    const [maximizedQuadrant, setMaximizedQuadrant] = useState<Quadrant | null>(null);

     const filteredTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return tasks.filter(task => {
            if (task.status === 'done') return false;

            const tagMatch = filters.tags.length === 0 || (task.tagId && filters.tags.includes(task.tagId));
            const energyMatch = filters.energy.length === 0 || (task.energyNeeded && filters.energy.includes(task.energyNeeded));
            
            const statusMatch = filters.status.length === 0 || filters.status.some(s => {
                if (s === 'overdue') {
                    return task.dueDate && new Date(task.dueDate + 'T00:00:00') < today;
                }
                return false;
            });

            return tagMatch && energyMatch && statusMatch;
        });
    }, [tasks, filters]);


    const tasksByQuadrant = useMemo(() => {
        const result: Record<Quadrant, Task[]> = { inbox: [], do: [], schedule: [], delegate: [], eliminate: [] };
        filteredTasks.forEach(task => {
            if (result[task.quadrant]) {
                result[task.quadrant].push(task);
            } else {
                result.inbox.push(task);
            }
        });
        for (const key in result) {
            result[key as Quadrant].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
        return result;
    }, [filteredTasks]);

    const handleOpenTaskModal = (task?: Partial<Task>) => setEditingTask(task || {});
    const handleCloseTaskModal = () => setEditingTask(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggingTask(task);
    };

    const handleDragEnd = () => {
        setDraggingTask(null);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newQuadrant: Quadrant, newIndex: number) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            handleUpdateTaskQuadrant(taskId, newQuadrant, newIndex);
        }
    };
    
    return (
        <main>
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={handleCloseTaskModal} />}
            {isLibraryOpen && <TaskLibraryModal routines={routines} onAddRoutine={handleAddRoutine} onAddTemplates={handleAddTemplates} onClose={() => setIsLibraryOpen(false)} />}
            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} filters={filters} onFilterChange={setFilters} />

            <div className="screen-content">
                <div className={styles.tasksHeader}>
                    <div className={styles.tasksTitle}>
                        <h2>Matriz de Prioridades</h2>
                    </div>
                    <div className={styles.tasksActions}>
                        {maximizedQuadrant && (
                            <button className="btn btn-secondary" onClick={() => setMaximizedQuadrant(null)}>
                                Restaurar Visão
                            </button>
                        )}
                        <button className="btn btn-secondary btn-icon" onClick={() => setIsLibraryOpen(true)} title="Biblioteca">
                            <Icon path={icons.bookOpen} />
                        </button>
                        <button className="btn btn-secondary btn-icon" onClick={() => setIsFilterPanelOpen(true)} title="Filtros">
                            <Icon path={icons.filter} />
                        </button>
                        <button className="btn btn-primary" onClick={() => handleOpenTaskModal({ isDetailed: true })}>
                            <Icon path={icons.plus} /> Nova
                        </button>
                    </div>
                </div>

                <div className={`${styles.tasksBoard} ${maximizedQuadrant ? styles.hasMaximized : ''}`}>
                     {(!maximizedQuadrant || maximizedQuadrant === 'inbox') && (
                        <QuadrantColumn
                            quadrant="inbox"
                            tasks={tasksByQuadrant.inbox}
                            onEdit={handleOpenTaskModal}
                            onSubtaskClick={() => {}} // Placeholder
                            onToggleSubtask={handleToggleSubtask}
                            draggingTask={draggingTask}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            isMaximized={maximizedQuadrant === 'inbox'}
                            onToggleMaximize={() => setMaximizedQuadrant(maximizedQuadrant === 'inbox' ? null : 'inbox')}
                        />
                    )}
                    <div className={styles.eisenhowerMatrix} style={{ display: maximizedQuadrant === 'inbox' ? 'none' : 'grid' }}>
                        {quadrants.filter(q => q.id !== 'inbox').map(q => {
                            if (maximizedQuadrant && maximizedQuadrant !== q.id) return null;
                            return (
                                <QuadrantColumn
                                    key={q.id}
                                    quadrant={q.id as Quadrant}
                                    tasks={tasksByQuadrant[q.id as Quadrant]}
                                    onEdit={handleOpenTaskModal}
                                    onSubtaskClick={() => {}} // Placeholder
                                    onToggleSubtask={handleToggleSubtask}
                                    draggingTask={draggingTask}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDrop={handleDrop}
                                    isMaximized={maximizedQuadrant === q.id}
                                    onToggleMaximize={() => setMaximizedQuadrant(maximizedQuadrant === q.id ? null : q.id as Quadrant)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
};
