
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUI } from '../context/UIContext';
import { Aura } from '../components/Aura';
import styles from './NotificationContainer.module.css';

export const NotificationContainer: React.FC = () => {
    const { notifications, clearAllNotifications } = useUI();

    // Pega APENAS a primeira notificação da fila para exibir.
    const activeNotification = notifications.length > 0 ? notifications[0] : null;

    return (
        <div className={styles.container}>
            <AnimatePresence mode='wait'>
                {
                    /* 
                        LOGICA DE FILA (FIFO):
                        Renderiza a Aura SOMENTE para a notificação ativa (a primeira da lista).
                        Quando ela é removida, a próxima (se houver) se torna a ativa e aparece.
                        Isso impede que as notificações "furem a fila" e se sobreponham.
                    */
                    activeNotification && (
                        <Aura key={activeNotification.id} notification={activeNotification} />
                    )
                }
            </AnimatePresence>

            {notifications.length > 1 && (
                <button 
                    onClick={clearAllNotifications} 
                    className={styles.clearButton}
                >
                    Limpar ({notifications.length})
                </button>
            )}
        </div>
    );
};
