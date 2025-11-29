import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import StackNavigator from './navigation/StackNavigator';
import DatabaseService from './database/DatabaseService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Inicializar la base de datos
        await DatabaseService.initialize();
        console.log('Base de datos inicializada correctamente');
        setIsReady(true);
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        setIsReady(true); // Continuar de todos modos
      }
    }

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});
