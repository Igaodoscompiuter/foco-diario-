
import React from 'react';
import { useUI } from '../context/UIContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Aura } from './Aura';
import styles from './NotificationContainer.module.css';

export const NotificationContainer: React.FC = () => {
    const { notifications, showClearAllButton, clearAllNotifications, promoteNotification } = useUI();

    const clearButtonAnimation = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: { type: 'spring', stiffness: 500, damping: 30 }
    }

    return (
        <div className={styles.notificationContainer}>
            <motion.div 
                className={styles.toastListContainer}
            >
                {/* 
                    A LÓGICA FOI SIMPLIFICADA:
                    - O `setTimeout` foi removido.
                    - `promoteNotification` é chamado diretamente quando a animação de saída termina.
                    - A estabilidade é garantida pelo `min-height` no CSS.
                */}
                <AnimatePresence onExitComplete={promoteNotification}>
                    {notifications.map(notification => (
                        <Aura 
                            key={notification.id} 
                            notification={notification}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {showClearAllButton && (
                    <motion.button 
                        onClick={clearAllNotifications} 
                        className={styles.clearButton}
                        initial={clearButtonAnimation.initial}
                        animate={clearButtonAnimation.animate}
                        exit={clearButtonAnimation.exit}
                        transition={clearButtonAnimation.transition}
                    >
                        Limpar
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};
