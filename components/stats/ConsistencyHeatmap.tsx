
import React, { useMemo } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { Task } from '../../types';
import styles from './ConsistencyHeatmap.module.css';

interface ConsistencyHeatmapProps {
  tasks: Task[];
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({ tasks }) => {
  const heatmapData = useMemo(() => {
    const taskCountsByDay: { [key: string]: number } = {};
    tasks.filter(t => t.status === 'done' && t.completedAt).forEach(task => {
        const date = new Date(task.completedAt!).toISOString().split('T')[0];
        taskCountsByDay[date] = (taskCountsByDay[date] || 0) + 1;
    });

    const data = [];
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const count = taskCountsByDay[dateString] || 0;
        
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 5) level = 2;
        else if (count > 5) level = 3;

        data.push({ date: dateString, count, level });
    }
    return data;
  }, [tasks]);

  return (
    <div className="card">
        <h4 className={styles.sectionTitle}>
            <Icon path={icons.calendar} /> Consistência
        </h4>
        <div className={styles.heatmapWrapper}>
            <div className={styles.heatmapGrid}>
                {heatmapData.map((day) => (
                    <div 
                        key={day.date} 
                        className={`${styles.heatmapCell} ${styles['level-' + day.level]}`}
                        title={`${day.date}: ${day.count} tarefas`}
                    ></div>
                ))}
            </div>
        </div>
        <p className={styles.footnote}>
            Últimos 3 meses
        </p>
    </div>
  );
};
