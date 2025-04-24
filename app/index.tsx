import React, { useState, useEffect } from 'react';
import { Text, View } from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Roles from './Roles';
import FlashScreen from './FlashScreen';

const Drawer = createDrawerNavigator();

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

  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Roles" component={Roles} />
    </Drawer.Navigator>
  );
}
