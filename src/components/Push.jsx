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

  useEffect(() => {
    async function checkSubscription() {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setIsSubscribed(true);
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
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

      // This is the function we will create in Supabase
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

  if (isLoading || !('PushManager' in window)) {
    return null; // Don't render button if loading or push not supported
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
