
import { useUI } from '../context/UIContext';

export const useUserData = () => {
    const { addNotification } = useUI();

    const exportData = () => {
        try {
            const data = JSON.stringify(localStorage);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'focusfrog_backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification('Dados exportados com sucesso!', '📤', 'success');
        } catch (error) {
            console.error("Falha ao exportar dados:", error);
            addNotification('Ocorreu um erro ao exportar os dados.', '❌', 'error');
        }
    };

    const importData = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (typeof data !== 'object' || data === null) throw new Error('Formato inválido');
                
                Object.keys(data).forEach(key => {
                    if (typeof key === 'string' && typeof data[key] === 'string') {
                         localStorage.setItem(key, data[key]);
                    }
                });
                addNotification('Dados importados! Reiniciando...', '📥', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                console.error("Falha ao importar dados:", error);
                addNotification('Arquivo de backup inválido.', '📄', 'error');
            }
        };
        reader.readAsText(file);
    };

    const resetData = () => {
        // A confirmação (ex: window.confirm) deve ser movida para a UI que chama esta função.
        // Isso torna o hook mais reutilizável e o fluxo de usuário mais controlado.
        try {
            localStorage.clear();
            addNotification('Dados apagados. Reiniciando...', '🗑️', 'info');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error("Falha ao resetar dados:", error);
            addNotification('Ocorreu um erro ao apagar os dados.', '❌', 'error');
        }
    };

    return { exportData, importData, resetData };
};
