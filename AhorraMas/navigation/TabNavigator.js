import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PantallaPrincipal from '../screens/Panel-Principal/PantallaPrincipal';
import PantallaEstadisticas from '../screens/Estadisticas/PantallaEstadisticas';
import PantallaListaTransacciones from '../screens/Transacciones/PantallaListaTransacciones';
import PantallaPresupuesto from '../screens/Presupuestos/PantallaPresupuesto';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: '#2a2a2a' }}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#2a2a2a',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 80,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#9ca3af',
            }}
        >
            <Tab.Screen name="Principal" component={PantallaPrincipal} />
            <Tab.Screen name="Estadísticas" component={PantallaEstadisticas} />
            <Tab.Screen name="Transacciones" component={PantallaListaTransacciones} />
            <Tab.Screen name="Presupuestos" component={PantallaPresupuesto} />
        </Tab.Navigator>
    );
};

export default TabNavigator;