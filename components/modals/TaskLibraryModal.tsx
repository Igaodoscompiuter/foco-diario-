
import React, { useState, useMemo } from 'react';
import type { TaskTemplate, Routine } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { defaultCategories } from '../../constants';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TaskLibraryModal.module.css';

interface TaskLibraryModalProps {
    routines: Routine[];
    onAddRoutine: (routine: Routine) => void;
    onAddTemplates: (templates: TaskTemplate[]) => void;
    onClose: () => void;
}

export const TaskLibraryModal: React.FC<TaskLibraryModalProps> = ({ routines, onAddRoutine, onAddTemplates, onClose }) => {
    const { taskTemplates } = useTasks();
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'routines' | 'templates'>('routines');

    const categories = useMemo(() => {
        const allCategories = Array.from(new Set(taskTemplates.map(t => t.category)));
        const categorySet = new Set([...allCategories, ...defaultCategories]);
        return Array.from(categorySet);
    }, [taskTemplates]);

    const handleToggleTemplate = (id: number) => {
        setSelectedTemplateIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleAccordion = (category: string) => {
        setActiveAccordion(prev => prev === category ? null : category);
    };

    const handleAddSelectedTemplates = () => {
        const templatesToAdd = taskTemplates.filter(t => selectedTemplateIds.includes(t.id));
        if (templatesToAdd.length > 0) {
            onAddTemplates(templatesToAdd);
        }
        onClose();
    };
    
    const handleAddRoutineAndClose = (routine: Routine) => {
        onAddRoutine(routine);
        onClose();
    };

    return (
        <div className="g-modal-overlay" onClick={onClose}>
            <div className="g-modal" onClick={(e) => e.stopPropagation()}>
                <header className="g-modal-header">
                    <div>
                        <h3><Icon path={icons.bookOpen} /> Biblioteca</h3>
                        <p className={styles.subtitle}>Adicione rotinas completas ou tarefas individuais para agilizar seu dia.</p>
                    </div>
                </header>
                
                 <div className={styles.libraryTabs}>
                    <button className={activeTab === 'routines' ? styles.active : ''} onClick={() => setActiveTab('routines')}>
                        <Icon path={icons.rotateCw} /> Rotinas
                    </button>
                    <button className={activeTab === 'templates' ? styles.active : ''} onClick={() => setActiveTab('templates')}>
                        <Icon path={icons.zap} /> Tarefas Rápidas
                    </button>
                </div>

                <main className="g-modal-body">
                    {activeTab === 'routines' && (
                         <div className={styles.routinesList}>
                            {routines.map(routine => (
                                <div key={routine.id} className={`card ${styles.routineCard}`}>
                                     <div className={styles.routineCardHeader}>
                                        <Icon path={icons[routine.icon as keyof typeof icons]} />
                                        <h5>{routine.name}</h5>
                                    </div>
                                    <p>{routine.description}</p>
                                    <button className="btn btn-secondary" onClick={() => handleAddRoutineAndClose(routine)}>
                                        <Icon path={icons.plus}/> Adicionar ({routine.taskTemplateIds.length}) Tarefas
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className={styles.taskLibraryAccordion}>
                            {categories.map(category => (
                                <div key={category} className={`${styles.accordionItem} ${activeAccordion === category ? styles.open : ''}`}>
                                    <div className={styles.accordionHeader} onClick={() => handleToggleAccordion(category)}>
                                        <span>{category}</span>
                                        <Icon path={icons.chevronDown} />
                                    </div>
                                    <div className={styles.accordionContent}>
                                        {taskTemplates.filter(t => t.category === category).map(template => (
                                            <div key={template.id} className={styles.templateItem} onClick={() => handleToggleTemplate(template.id)}>
                                                <input type="checkbox" checked={selectedTemplateIds.includes(template.id)} readOnly />
                                                <span className={styles.checkboxVisual}><Icon path={icons.check} /></span>
                                                <label>{template.title}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <footer className="g-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} style={{ marginLeft: activeTab === 'templates' ? '0' : 'auto' }}>Fechar</button>
                    {activeTab === 'templates' && (
                        <button className="btn btn-primary" onClick={handleAddSelectedTemplates} disabled={selectedTemplateIds.length === 0} style={{ marginLeft: 'auto' }}>
                            Adicionar Tarefas ({selectedTemplateIds.length})
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};
