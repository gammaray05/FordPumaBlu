import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Helper function to convert urlBase64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function Push() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    setIsIos(isIosDevice);
    setIsStandalone(isInStandaloneMode);

    if (isIosDevice && !isInStandaloneMode) {
      setIsLoading(false);
      return;
    }

    async function checkSubscription() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setIsSubscribed(true);
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      }
      setIsLoading(false);
    }

    checkSubscription();
  }, []);

  const subscribeUser = async () => {
    if (!vapidPublicKey || vapidPublicKey === 'INCOLLA_QUI_LA_TUA_PUBLIC_KEY') {
        console.error('VAPID Public Key not set. Please set it in your .env file.');
        alert('La configurazione delle notifiche non è completa.');
        return;
    }
    
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const { error } = await supabase.functions.invoke('save-subscription', {
        body: sub,
      });
      if (error) throw error;

      console.log('Subscription saved successfully');
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
      alert('Impossibile attivare le notifiche.');
    }
  };

  const unsubscribeUser = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        // TODO: Also remove from backend DB via another edge function
        console.log('User is unsubscribed.');
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to unsubscribe the user: ', error);
    }
  };

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  // If on iOS and not in standalone mode, show a message
  if (isIos && !isStandalone) {
    return (
      <div className="text-center text-xs text-gray-600 mt-4 p-3 rounded-lg bg-gray-100">
        Per abilitare le notifiche, aggiungi l'app alla schermata Home: tocca l'icona di condivisione <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg> e seleziona "Aggiungi a Home".
      </div>
    );
  }

  // If push notifications are not supported at all (and not the iOS case above)
  if (!('PushManager' in window)) {
    return null;
  }

  return (
    <button 
        onClick={isSubscribed ? unsubscribeUser : subscribeUser}
        className="btn bg-white/80 shadow text-gray-800 text-xs font-bold px-4 py-2 rounded-lg mt-4"
    >
      {isSubscribed ? 'Disattiva Notifiche Push' : 'Attiva Notifiche Push'}
    </button>
  );
}

export default Push;
