
import React, { useState, createContext, useContext, ReactNode, useCallback, useEffect, useReducer, useRef } from 'react';
import type { Screen, Task, Notification as NotificationType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type NotificationCategory = 'victory' | 'success' | 'info' | 'error';

export interface Notification extends NotificationType {
    category: NotificationCategory;
}

const MAX_VISIBLE_NOTIFICATIONS = 1;
const MIN_NOTIFICATIONS_FOR_CLEAR_ALL = 2; // O botão aparece se houver 2 ou mais notificações no total (visível + fila)

// --- Reducer (Restaurado para a versão com Fila) ---
interface NotificationsState {
    visible: Notification[];
    queue: Notification[];
    showClearAll: boolean; // Controla a visibilidade do botão "Limpar"
}

type NotificationsAction = 
    | { type: 'ADD_TO_VISIBLE'; payload: Notification }
    | { type: 'ADD_TO_QUEUE'; payload: Notification } 
    | { type: 'REMOVE'; payload: { id: number } }
    | { type: 'PROMOTE' }
    | { type: 'CLEAR_ALL' };

const notificationReducer = (state: NotificationsState, action: NotificationsAction): NotificationsState => {
    let nextState: NotificationsState;

    switch (action.type) {
        case 'ADD_TO_VISIBLE':
            nextState = { ...state, visible: [...state.visible, action.payload] };
            break;
        case 'ADD_TO_QUEUE':
            nextState = { ...state, queue: [...state.queue, action.payload] };
            break;
        case 'REMOVE':
            nextState = { ...state, visible: state.visible.filter(n => n.id !== action.payload.id) };
            break;
        case 'PROMOTE':
            if (state.visible.length < MAX_VISIBLE_NOTIFICATIONS && state.queue.length > 0) {
                const [nextInQueue, ...remainingQueue] = state.queue;
                nextState = { ...state, visible: [...state.visible, nextInQueue], queue: remainingQueue };
            } else {
                nextState = state; // Sem alterações se não houver espaço ou a fila estiver vazia
            }
            break;
        case 'CLEAR_ALL':
            // Limpa ambas as listas e esconde o botão
            return { visible: [], queue: [], showClearAll: false };
        default:
            return state;
    }

    // Após cada ação, recalcula se o botão "Limpar" deve ser mostrado.
    const total = nextState.visible.length + nextState.queue.length;
    nextState.showClearAll = total >= MIN_NOTIFICATIONS_FOR_CLEAR_ALL;
    
    return nextState;
};


// --- Tipos e Contexto (Restaurados) ---
export type Density = 'compact' | 'normal' | 'spaced';

export interface UIContextType {
    activeScreen: Screen;
    handleNavigate: (screen: Screen, options?: any) => void;
    taskInFocus: Task | null;
    setTaskInFocus: React.Dispatch<React.SetStateAction<Task | null>>;
    subtaskInFocusId: string | null;
    setSubtaskInFocusId: React.Dispatch<React.SetStateAction<string | null>>;
    notifications: Notification[];
    queueCount: number; // Necessário para o Aura.tsx saber se precisa acelerar (agora removido de lá, mas mantido aqui para outras finalidades)
    showClearAllButton: boolean;
    addNotification: (message: string, icon: string, category: NotificationCategory) => void;
    removeNotification: (id: number) => void;
    promoteNotification: () => void; // A função de promover da fila para visível
    clearAllNotifications: () => void;
    density: Density;
    setDensity: React.Dispatch<React.SetStateAction<Density>>;
    soundEnabled: boolean;
    setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    hapticsEnabled: boolean;
    setHapticsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    isImmersiveMode: boolean;
    setIsImmersiveMode: React.Dispatch<React.SetStateAction<boolean>>;
    installPrompt: any;
    handleInstallApp: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};

// --- Provedor (Restaurado) ---
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const [taskInFocus, setTaskInFocus] = useState<Task | null>(null);
    const [subtaskInFocusId, setSubtaskInFocusId] = useState<string | null>(null);
    const [density, setDensity] = useLocalStorage<Density>('focusfrog_density', 'normal');
    const [hapticsEnabled, setHapticsEnabled] = useLocalStorage<boolean>('focusfrog_haptics_enabled', true);
    const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('focusfrog_sound_enabled', true);
    const [isImmersiveMode, setIsImmersiveMode] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    const [notificationsState, dispatch] = useReducer(notificationReducer, { visible: [], queue: [], showClearAll: false });

    const addNotification = useCallback((message: string, icon: string, category: NotificationCategory) => {
        const newNotification: Notification = { id: Date.now() + Math.random(), message, icon, category };

        // Lógica original: se houver espaço, mostra; senão, enfileira.
        if (notificationsState.visible.length < MAX_VISIBLE_NOTIFICATIONS) {
            dispatch({ type: 'ADD_TO_VISIBLE', payload: newNotification });
        } else {
            dispatch({ type: 'ADD_TO_QUEUE', payload: newNotification });
        }

        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(50);
    }, [notificationsState.visible.length, hapticsEnabled]);

    const removeNotification = useCallback((id: number) => {
        dispatch({ type: 'REMOVE', payload: { id } });
    }, []);

    // A promoção é chamada quando uma notificação termina sua animação de saída
    const promoteNotification = useCallback(() => {
        dispatch({ type: 'PROMOTE' });
    }, []);

    const clearAllNotifications = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(20);
    }, [hapticsEnabled]);

    const handleInstallApp = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
    };
    
    const handleNavigate = (screen: Screen, options?: any) => {
        if (activeScreen === 'focus' && screen !== 'focus') {
            setIsImmersiveMode(false);
        }
        setActiveScreen(screen);
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(5);
    }

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const value: UIContextType = {
        activeScreen,
        handleNavigate,
        taskInFocus, setTaskInFocus,
        subtaskInFocusId, setSubtaskInFocusId,
        notifications: notificationsState.visible,
        queueCount: notificationsState.queue.length,
        showClearAllButton: notificationsState.showClearAll,
        addNotification,
        removeNotification,
        promoteNotification,
        clearAllNotifications,
        density, setDensity,
        soundEnabled, setSoundEnabled,
        hapticsEnabled, setHapticsEnabled,
        isImmersiveMode, setIsImmersiveMode,
        installPrompt,
        handleInstallApp,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
