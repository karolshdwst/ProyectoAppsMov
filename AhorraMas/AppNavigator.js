import React, { useState } from 'react';
import PantallaBienvenida from './screens/Autenticacion/PantallaBienvenida';
import PantallaLogin from './screens/Autenticacion/PantallaLogin';
import PantallaRegistro from './screens/Autenticacion/PantallaRegistro';
import ForgotPasswordScreen from './screens/Autenticacion/OlvidasteContrasenna';
import PantallaPrincipal from './screens/Panel-Principal/PantallaPrincipal';
import PantallaEstadisticas from './screens/Estadisticas/PantallaEstadisticas';
import PantallaListaTransacciones from './screens/Transacciones/PantallaListaTransacciones';
import PantallaFormularioTransaccion from './screens/Transacciones/PantallaFormularioTransaccion';
import PantallaPresupuesto from './screens/Presupuestos/PantallaPresupuesto';

const AppNavigator = () => {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [activeTab, setActiveTab] = useState('home');

    const handleNavigate = (screen) => {
        console.log(`Navegando a: ${screen}`);
        setCurrentScreen(screen);
    };

    const handleTabChange = (tab) => {
        console.log(`Cambiando a tab: ${tab}`);
        setActiveTab(tab);
        
        // Mapear tabs a pantallas
        switch (tab) {
            case 'home':
                setCurrentScreen('main');
                break;
            case 'balance':
                setCurrentScreen('estadisticas');
                break;
            case 'transactions':
                setCurrentScreen('transacciones');
                break;
            case 'user':
                setCurrentScreen('presupuestos');
                break;
        }
    };

    const handleAddTransaction = () => {
        console.log('Navegando a formulario de transacción');
        setCurrentScreen('formulario-transaccion');
    };

    const handleBackToTransactions = () => {
        console.log('Volviendo a lista de transacciones');
        setCurrentScreen('transacciones');
    };

    const handleLogin = () => {
        console.log('Navegando a pantalla principal');
        setCurrentScreen('main');
        setActiveTab('home');
    };

    const handleRegister = () => {
        console.log('Registro completado, navegando a login');
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
            case 'forgot-password':
                return (
                    <ForgotPasswordScreen
                        onNavigate={handleNavigate}
                    />
                );
            case 'main':
                return (
                    <PantallaPrincipal
                        onNavigate={handleNavigate}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                );
            case 'estadisticas':
                return (
                    <PantallaEstadisticas
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                );
            case 'transacciones':
                return (
                    <PantallaListaTransacciones
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        onAdd={handleAddTransaction}
                    />
                );
            case 'formulario-transaccion':
                return (
                    <PantallaFormularioTransaccion
                        onSave={handleBackToTransactions}
                        onCancel={handleBackToTransactions}
                    />
                );
            case 'presupuestos':
                return (
                    <PantallaPresupuesto
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                );
            default:
                return <PantallaBienvenida onNavigate={handleNavigate} />;
        }
    };

    return renderScreen();
};

export default AppNavigator;