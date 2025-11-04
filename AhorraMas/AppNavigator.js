import React, { useState } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const AppNavigator = () => {
    const [currentScreen, setCurrentScreen] = useState('welcome');

    const handleNavigate = (screen) => {
        console.log(`Navegando a: ${screen}`);
        setCurrentScreen(screen);
    };

    const handleLogin = () => {
        console.log('Usuario logueado exitosamente');
        // Aquí podrías navegar a la pantalla principal de la app
        alert('¡Login exitoso!');
    };

    const handleRegister = () => {
        console.log('Usuario registrado exitosamente');
        // Aquí podrías navegar a la pantalla principal o al login
        alert('¡Registro exitoso!');
        setCurrentScreen('login');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'login':
                return (
                    <LoginScreen
                        onLogin={handleLogin}
                        onNavigate={handleNavigate}
                    />
                );
            case 'register':
                return (
                    <RegisterScreen
                        onRegister={handleRegister}
                        onNavigate={handleNavigate}
                    />
                );
            default:
                return <WelcomeScreen onNavigate={handleNavigate} />;
        }
    };

    return renderScreen();
};

export default AppNavigator;