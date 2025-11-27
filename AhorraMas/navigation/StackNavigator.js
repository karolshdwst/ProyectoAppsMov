import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PantallaBienvenida from '../screens/Autenticacion/PantallaBienvenida';
import PantallaLogin from '../screens/Autenticacion/PantallaLogin';
import PantallaRegistro from '../screens/Autenticacion/PantallaRegistro';
import OlvidasteContrasenna from '../screens/Autenticacion/OlvidasteContrasenna';
import PantallaFormularioTransaccion from '../screens/Transacciones/PantallaFormularioTransaccion';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Bienvenida"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Bienvenida"
                component={PantallaBienvenida}
            />
            <Stack.Screen
                name="Login"
                component={PantallaLogin}
            />
            <Stack.Screen
                name="Registro"
                component={PantallaRegistro}
            />
            <Stack.Screen
                name="OlvidarContrasenna"
                component={OlvidasteContrasenna}
            />
            <Stack.Screen
                name="FormularioTransaccion"
                component={PantallaFormularioTransaccion}
            />
            <Stack.Screen
                name="Main"
                component={TabNavigator}
            />
        </Stack.Navigator>
    );
};

export default StackNavigator;
