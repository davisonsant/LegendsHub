import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { migrateLegacyStorage } from './utils/localForageStore';

// Run standard migrator instantly on page payload load
migrateLegacyStorage().then(() => {
  console.log('[Storage Boot] Legacy localStorage migrated safely into IndexedDB (localForage).');
}).catch(err => {
  console.error('[Storage Boot] Error during localStorage migration:', err);
});

// Safely override localStorage.setItem and sessionStorage.setItem to handle quota exceeded errors and avoid app crash
if (typeof window !== 'undefined' && typeof Storage !== 'undefined') {
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    try {
      originalSetItem.call(this, key, value);
    } catch (error: any) {
      console.warn(`[Storage Monitor] Failed to set key "${key}" (Size: ${(value.length / 1024).toFixed(1)} KB):`, error);
      
      const isQuotaError = 
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22 ||
        error.code === 1014;

      if (isQuotaError) {
        const lastAlert = (window as any).__lastStorageQuotaAlert || 0;
        const now = Date.now();
        if (now - lastAlert > 20000) { // 20s throttle
          (window as any).__lastStorageQuotaAlert = now;
          alert(
            "⚠️ ATENÇÃO: Limite de Armazenamento Excedido!\n\n" +
            "O banco de dados tornou-se muito grande para os limites padrão do seu navegador (5MB quota do LocalStorage).\n\n" +
            "As alterações continuarão funcionando nesta sessão ativa na memória, mas não serão recarregadas automaticamente se você fechar a aba.\n\n" +
            "💡 DICA: Vá no menu de salvar do Editor e Remova/Exclua bancos de dados antigos ou diminua o uso de imagens em base64 customizadas para liberar espaço."
          );
        }
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
