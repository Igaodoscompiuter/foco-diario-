
import React from 'react';
import { BottomNav } from './BottomNav';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { useUI } from '../context/UIContext';
import type { Screen } from '../types';
import { NotificationContainer } from './NotificationContainer'; // Importa o novo container

const screenMap: Record<Screen, React.ComponentType> = {
    dashboard: DashboardScreen,
    tasks: TasksScreen,
    focus: FocusScreen,
    stats: StatsScreen,
    rewards: RewardsScreen,
};

export const AppLayout: React.FC = () => {
    const { activeScreen, density, isImmersiveMode } = useUI();

    const ActiveScreenComponent = screenMap[activeScreen];

    return (
        <div className={`app-container screen-${activeScreen} density-${density} ${isImmersiveMode ? 'immersive-mode' : ''}`}>
            <div className="screen-content">
                <ActiveScreenComponent />
            </div>
            
            {!isImmersiveMode && <BottomNav />}

            {/* Renderiza o container de notificações de forma limpa e separada */}
            <NotificationContainer />
        </div>
    );
};
