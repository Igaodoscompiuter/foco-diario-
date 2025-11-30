
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Notification, useUI } from '../context/UIContext';
import styles from './Aura.module.css';

const AUTO_DISMISS_DURATION = 3000; 
const AUTO_DISMISS_ERROR_DURATION = 5000;

interface AuraProps {
    notification: Notification;
}

export const Aura: React.FC<AuraProps> = ({ notification }) => {
    const { removeNotification } = useUI();

    useEffect(() => {
        const duration = notification.category === 'error' 
            ? AUTO_DISMISS_ERROR_DURATION 
            : AUTO_DISMISS_DURATION;

        const timerId = setTimeout(() => {
            removeNotification(notification.id);
        }, duration);

        return () => {
            clearTimeout(timerId);
        };
    }, [notification.id, notification.category, removeNotification]);

    const categoryClass = styles[`aura--${notification.category}`] || '';

    // ANIMAÇÃO HORIZONTAL CONTÍNUA, COMO SOLICITADO
    const slideAnimation = {
        // 1. Começa fora da tela, à direita.
        initial: { x: '100%', opacity: 0 },
        
        // 2. Para no centro da tela para exibição.
        animate: { x: '-50%', opacity: 1 },    
        
        // 3. Continua o movimento para a esquerda para sair.
        exit: { x: '-150%', opacity: 0 },
        
        // Transição de mola para um movimento fluido.
        transition: { type: 'spring', stiffness: 400, damping: 40 }
    };

    return (
        <motion.div
            initial={slideAnimation.initial}
            animate={slideAnimation.animate}
            exit={slideAnimation.exit}
            transition={slideAnimation.transition}
            className={`${styles.aura} ${categoryClass}`}
        >
            <span className={styles.icon}>{notification.icon}</span>
            <span className={styles.message}>{notification.message}</span>
        </motion.div>
    );
};
