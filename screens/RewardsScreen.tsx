
import React, { useState, useRef } from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { useUserData } from '../hooks/useUserData';
import styles from './RewardsScreen.module.css';

interface ShopItem { id: string; type: 'theme' | 'sound'; name: string; description: string; cost: number; previewColor?: string; icon?: keyof typeof icons; }

const shopCatalog: ShopItem[] = [
    { id: 'theme-forest', type: 'theme', name: 'Tema Floresta', description: 'Verdes profundos e tons de terra.', cost: 100, previewColor: '#2f5d62' },
    { id: 'theme-ocean', type: 'theme', name: 'Tema Oceano', description: 'Azuis serenos e cinzas suaves.', cost: 100, previewColor: '#3a5ba0' },
    { id: 'theme-sunset', type: 'theme', name: 'Tema Pôr do Sol', description: 'Gradientes quentes de laranja e roxo.', cost: 250, previewColor: '#ff8c61' },
    { id: 'theme-neon', type: 'theme', name: 'Tema Neon', description: 'Vibrante e elétrico para noites de codificação.', cost: 500, previewColor: '#c700ff' },
    { id: 'sound-rain', type: 'sound', name: 'Chuva Suave', description: 'Som ambiente de chuva calma.', cost: 50, icon: 'cloudRain' },
    { id: 'sound-keyboard', type: 'sound', name: 'Teclado Mecânico', description: 'Cliques satisfatórios para o foco.', cost: 150, icon: 'keyboard' },
];

export const RewardsScreen: React.FC = () => {
    const { activeThemeId, setActiveThemeId, activeSoundId, setActiveSoundId, pontosFoco, setPontosFoco, unlockedRewards, setUnlockedRewards } = useTheme();
    const { density, setDensity, addNotification, soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled, setDevModeEnabled } = useUI();
    const { exportData, importData, resetData } = useUserData();
    
    const [activeTab, setActiveTab] = useState<'shop' | 'settings'>('shop');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [devTapCount, setDevTapCount] = useState(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleVersionClick = () => {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        const newCount = devTapCount + 1;
        setDevTapCount(newCount);
        if (newCount >= 7) {
            setDevModeEnabled(true);
            addNotification('Modo de Desenvolvedor Ativado!', '👾', 'info');
            setDevTapCount(0);
        } else {
            tapTimeoutRef.current = setTimeout(() => setDevTapCount(0), 1500);
        }
    };

    const handlePurchase = (item: ShopItem) => {
        if (pontosFoco >= item.cost) {
            setPontosFoco(pontosFoco - item.cost);
            setUnlockedRewards([...unlockedRewards, item.id]);
            addNotification(`Item '${item.name}' comprado!`, '🛍️', 'victory');
        } else {
            addNotification('Pontos de Foco insuficientes!', '🪙', 'error');
        }
    };

    const handleEquip = (item: ShopItem) => {
        if (item.type === 'theme') setActiveThemeId(item.id);
        if (item.type === 'sound') setActiveSoundId(item.id);
        addNotification(`'${item.name}' equipado!`, '🎨', 'success');
    };
    
    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
        }
    };

    return (
        <main className="screen-content">
            <div className={styles.rewardsHeader}>
                <h2>Personalizar</h2>
                <div className={styles.pointsDisplay}><Icon path={icons.trophy} /> <span>{pontosFoco}</span></div>
            </div>

            <div className={styles.rewardsHeaderTabs}>
                 <button onClick={() => setActiveTab('shop')} className={`${styles.tabButton} ${activeTab === 'shop' ? styles.active : ''}`}>Loja</button>
                 <button onClick={() => setActiveTab('settings')} className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}>Configurações</button>
            </div>

            {activeTab === 'shop' && (
                 <div className={`${styles.tabContent} ${styles.fadeIn}`}>
                    <div className={styles.shopGrid}>
                        {shopCatalog.map(item => {
                            const isUnlocked = unlockedRewards.includes(item.id);
                            const isEquipped = item.type === 'theme' ? activeThemeId === item.id : activeSoundId === item.id;
                            return (
                                <div key={item.id} className={`card ${styles.shopItem}`}>
                                    <div className={styles.itemHeader}>
                                        {item.previewColor && <div className={styles.itemPreview} style={{ backgroundColor: item.previewColor }}></div>}
                                        {item.icon && <Icon path={icons[item.icon]} className={styles.itemIcon} />}
                                        <h4 className={styles.itemName}>{item.name}</h4>
                                    </div>
                                    <p className={styles.itemDescription}>{item.description}</p>
                                    <div className={styles.itemFooter}>
                                        {!isUnlocked ? (
                                            <button className="btn btn-primary" onClick={() => handlePurchase(item)} disabled={pontosFoco < item.cost}>
                                                <Icon path={icons.lock} /> Comprar ({item.cost})
                                            </button>
                                        ) : (
                                            <button className="btn btn-secondary" onClick={() => handleEquip(item)} disabled={isEquipped}>
                                                {isEquipped ? 'Equipado' : 'Equipar'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className={`${styles.tabContent} ${styles.fadeIn}`}>
                    <div className="card">
                        <h4 className={styles.sectionTitle}>Interface</h4>
                        <div className={styles.settingRow}>
                            <label>Densidade da UI</label>
                            <select value={density} onChange={(e) => setDensity(e.target.value as any)} className={styles.select}>
                                <option value="compact">Compacta</option>
                                <option value="comfortable">Confortável</option>
                                <option value="spacious">Espaçosa</option>
                            </select>
                        </div>
                    </div>
                    <div className="card">
                         <h4 className={styles.sectionTitle}>Preferências</h4>
                         <div className={styles.settingRow}>
                            <label>Efeitos sonoros</label>
                            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} className={styles.switch} />
                        </div>
                         <div className={styles.settingRow}>
                            <label>Vibração (Haptics)</label>
                            <input type="checkbox" checked={hapticsEnabled} onChange={(e) => setHapticsEnabled(e.target.checked)} className={styles.switch} />
                        </div>
                    </div>
                    <div className="card">
                        <h4 className={styles.sectionTitle}>Gerenciamento de Dados</h4>
                        <div className={styles.dataActions}>
                            <button className="btn btn-secondary" onClick={exportData}><Icon path={icons.download} /> Exportar</button>
                            <button className="btn btn-secondary" onClick={handleImportClick}><Icon path={icons.upload} /> Importar</button>
                            <button className="btn btn-danger" onClick={resetData}><Icon path={icons.trash} /> Resetar</button>
                        </div>
                    </div>
                    <div className={styles.appVersion} onClick={handleVersionClick}>
                        FocusFrog v1.1.0 • Feito com 💚
                    </div>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".json" onChange={handleFileChange} />
                </div>
            )}
        </main>
    );
};
