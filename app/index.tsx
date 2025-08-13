import React, { useState, useEffect } from 'react';
import FlashScreen from './FlashScreen';
import LoginScreen from './LoginScreen';

export default function Index() {
  const [showFlash, setShowFlash] = useState(true);

  useEffect(() => {
    // Hide flash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowFlash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showFlash) {
    return <FlashScreen />;
  }

  // Show login screen after flash screen
  return <LoginScreen />;
}
