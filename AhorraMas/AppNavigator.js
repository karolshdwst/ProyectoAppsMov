import React, { useState } from 'react';
import PantallaBienvenida from './screens/Autenticacion/PantallaBienvenida';
import PantallaLogin from './screens/Autenticacion/PantallaLogin';
import PantallaRegistro from './screens/Autenticacion/PantallaRegistro';
import PantallaPresupuesto from './screens/Presupuestos/PantallaPresupuesto';

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
                    <PantallaLogin
                        onLogin={handleLogin}
                        onNavigate={handleNavigate}
                    />
                );
            case 'register':
                return (
                    <PantallaRegistro
                        onRegister={handleRegister}
                        onNavigate={handleNavigate}
                    />
                );
            case 'presupuesto':
                return (
                    <PantallaPresupuesto
                        onNavigate={handleNavigate}
                    />
                );
            default:
                return <PantallaBienvenida onNavigate={handleNavigate} />;
        }
    };

    return renderScreen();
};

export default AppNavigator;