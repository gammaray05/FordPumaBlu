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
        Per abilitare le notifiche, aggiungi l'app alla schermata Home: tocca l'icona di condivisione <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 48 48" version="1.1" className="inline-block"><path fill="currentColor" d="M37.75,20.75 C38.3972087,20.75 38.9295339,21.2418747 38.9935464,21.8721948 L39,22 L39,36.75 C39,39.5770076 36.7655511,41.8821316 33.9664046,41.995621 L33.75,42 L14.25,42 C11.4229924,42 9.11786837,39.7655511 9.00437905,36.9664046 L9,36.75 L9,22 C9,21.3096441 9.55964406,20.75 10.25,20.75 C10.8972087,20.75 11.4295339,21.2418747 11.4935464,21.8721948 L11.5,22 L11.5,36.75 C11.5,38.2125318 12.6417046,39.4084043 14.0824777,39.4949812 L14.25,39.5 L33.75,39.5 C35.2125318,39.5 36.4084043,38.3582954 36.4949812,36.9175223 L36.5,36.75 L36.5,22 C36.5,21.3096441 37.0596441,20.75 37.75,20.75 Z M15.0903301,14.1442911 L22.8685047,6.36611652 C23.3241164,5.91050485 24.0439368,5.88013074 24.5347763,6.27499419 L24.6362716,6.36611652 L32.4144462,14.1442911 C32.9026016,14.6324465 32.9026016,15.4239027 32.4144462,15.9120581 C31.9588346,16.3676697 31.2390141,16.3980439 30.7481746,16.0031804 L30.6466793,15.9120581 L25,10.265 L25,30.5 C25,31.1472087 24.5081253,31.6795339 23.8778052,31.7435464 L23.75,31.75 C23.1027913,31.75 22.5704661,31.2581253 22.5064536,30.6278052 L22.5,30.5 L22.5,10.269 L16.858097,15.9120581 C16.4024854,16.3676697 15.6826649,16.3980439 15.1918254,16.0031804 L15.0903301,15.9120581 C14.6347184,15.4564464 14.6043443,14.736626 14.9992078,14.2457865 L15.0903301,14.1442911 L22.8685047,6.36611652 L15.0903301,14.1442911 Z"/></svg> e seleziona "Aggiungi alla schermata Home".
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
