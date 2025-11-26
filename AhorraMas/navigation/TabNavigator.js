import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PantallaPrincipal from '../screens/Panel-Principal/PantallaPrincipal';
import PantallaEstadisticas from '../screens/Estadisticas/PantallaEstadisticas';
import PantallaListaTransacciones from '../screens/Transacciones/PantallaListaTransacciones';
import PantallaPresupuesto from '../screens/Presupuestos/PantallaPresupuesto';
import NavegacionInferior from '../screens/Compartidos/NavegacionInferior';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <NavegacionInferior {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Inicio"
                component={PantallaPrincipal}
            />
            <Tab.Screen
                name="Balance"
                component={PantallaEstadisticas}
            />
            <Tab.Screen
                name="Transacciones"
                component={PantallaListaTransacciones}
            />
            <Tab.Screen
                name="Usuario"
                component={PantallaPresupuesto}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
