import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm" role="alert">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {offlineReady ? 'App ready to work offline.' : 'New version available.'}
      </p>
      <div className="flex space-x-2">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update
          </button>
        )}
        <button onClick={close} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          Dismiss
        </button>
      </div>
    </div>
  );
}
