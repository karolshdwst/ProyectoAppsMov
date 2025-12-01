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
                    height: 100,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarShowLabel: true,
                tabBarIcon: () => null, // Sin iconos
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    textAlign: 'center',
                },
                tabBarItemStyle: {
                    paddingVertical: 5,
                },
                tabBarAllowFontScaling: false, // Evita que el sistema escale el texto
            }}
        >
            <Tab.Screen 
                name="Principal" 
                component={PantallaPrincipal}
                options={{ tabBarLabel: 'Principal' }}
            />
            <Tab.Screen 
                name="Estadísticas" 
                component={PantallaEstadisticas}
                options={{ tabBarLabel: 'Estadísticas' }}
            />
            <Tab.Screen 
                name="Transacciones" 
                component={PantallaListaTransacciones}
                options={{ tabBarLabel: 'Transacciones' }}
            />
            <Tab.Screen 
                name="Presupuestos" 
                component={PantallaPresupuesto}
                options={{ tabBarLabel: 'Presupuestos' }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;