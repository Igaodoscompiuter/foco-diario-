

import React from 'react';
import { useTasks } from '../../context/TasksContext';
import type { TaskFilters, EnergyLevel, Tag } from '../../types';
import { Icon } from '../Icon';
import { icons } from '../Icons';

// Importando os estilos modulares para manter o escopo de algumas classes
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: TaskFilters;
    onFilterChange: (filters: TaskFilters) => void;
}

const statusOptions: { id: 'overdue' | 'frog', label: string }[] = [
    { id: 'overdue', label: 'Atrasada' },
    { id: 'frog', label: 'Sapo do Dia' },
];
const energyOptions: { id: EnergyLevel, label: string }[] = [
    { id: 'low', label: 'Baixa Energia' },
    { id: 'medium', label: 'Média Energia' },
    { id: 'high', label: 'Alta Energia' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, onFilterChange }) => {
    const { tags } = useTasks();

    const handleToggleFilter = (key: keyof TaskFilters, value: string | number) => {
        const newFilters = { ...filters };
        
        switch (key) {
            case 'tags': {
                const current = newFilters.tags;
                const val = value as number;
                newFilters.tags = current.includes(val) ? current.filter(t => t !== val) : [...current, val];
                break;
            }
            case 'status': {
                const current = newFilters.status;
                const val = value as 'overdue' | 'frog';
                newFilters.status = current.includes(val) ? current.filter(s => s !== val) : [...current, val];
                break;
            }
            case 'energy': {
                const current = newFilters.energy;
                const val = value as EnergyLevel;
                newFilters.energy = current.includes(val) ? current.filter(e => e !== val) : [...current, val];
                break;
            }
        }
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        onFilterChange({ tags: [], status: [], energy: [] });
    };

    // Não renderiza nada se não estiver aberto
    if (!isOpen) {
        return null;
    }

    return (
        <div className="g-modal-overlay" onClick={onClose}>
            <div className="g-modal" onClick={(e) => e.stopPropagation()}>
                <div className="g-modal-header">
                    <h3><Icon path={icons.sliders} /> Filtros</h3>
                    <button onClick={onClose} className="btn btn-secondary btn-icon" aria-label="Fechar filtros">
                        <Icon path={icons.close} />
                    </button>
                </div>
                <div className={styles.panelBody}>
                    <div className={styles.filterSection}>
                        <h4>Status</h4>
                        <div className={styles.filterOptions}>
                            {statusOptions.map(option => (
                                <label key={option.id} className={styles.filterCheckbox}>
                                    <input type="checkbox" checked={filters.status.includes(option.id)} onChange={() => handleToggleFilter('status', option.id)} />
                                    <span className={styles.checkboxVisual}><Icon path={icons.check} /></span>
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                     <div className={styles.filterSection}>
                        <h4>Tags</h4>
                        <div className={styles.filterOptions}>
                             {tags.map(tag => (
                                <label key={tag.id} className={styles.filterCheckbox}>
                                    <input type="checkbox" checked={filters.tags.includes(tag.id)} onChange={() => handleToggleFilter('tags', tag.id)} />
                                    <span className={styles.checkboxVisual}><Icon path={icons.check} /></span>
                                    <span className={styles.tagColorDot} style={{backgroundColor: tag.color}}></span>
                                    <span>{tag.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                     <div className={styles.filterSection}>
                        <h4>Energia</h4>
                        <div className={styles.filterOptions}>
                            {energyOptions.map(option => (
                                <label key={option.id} className={styles.filterCheckbox}>
                                    <input type="checkbox" checked={filters.energy.includes(option.id)} onChange={() => handleToggleFilter('energy', option.id)} />
                                    <span className={styles.checkboxVisual}><Icon path={icons.check} /></span>
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                </div>
                 <div className={styles.panelFooter}>
                    <button className="btn btn-secondary" onClick={handleClearFilters}>Limpar</button>
                    <button className="btn btn-primary" onClick={onClose}>Aplicar</button>
                </div>
            </div>
        </div>
    );
};
