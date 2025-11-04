import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

const PantallaPresupuesto = ({ presupuestos = [], onUpdateBudget, onLogout, activeTab, onTabChange }) => {
  const [presupuestoEditando, setPresupuestoEditando] = useState(null);
  const [nuevoLimite, setNuevoLimite] = useState('');

  const manejarCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: onLogout }
      ]
    );
  };

  const manejarAgregarCategoria = () => {
    Alert.alert(
      'Agregar Categoría',
      'Agregar presupuesto',
      [{ text: 'OK' }]
    );
  };

  const manejarConfiguración = () => {
    Alert.alert(
      'Configuración',
      'Configuración de presupuestos',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.contenedorPrincipal}>
      <View style={styles.contenedorPantalla}>
        <ScrollView 
          contentContainerStyle={styles.scrollContenido}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta Usuario */}
          <View style={styles.tarjetaUsuario}>
            <View style={styles.avatarUsuario}>
              <Text style={styles.avatarTexto}>👤</Text>
            </View>
            <View style={styles.infoUsuario}>
              <Text style={styles.nombreUsuario}>Usuario</Text>
              <Text style={styles.correoUsuario}>usuario@ahorra.app</Text>
            </View>
          </View>

          <Text style={styles.tituloSeccion}>Presupuestos Mensuales</Text>

          <View style={styles.listaPresupuestos}>
            {presupuestos.length > 0 ? (
              presupuestos.map(item => (
                <View key={item.id} style={styles.itemPresupuesto}>
                  <Text style={styles.categoriaPresupuesto}>{item.categoria}</Text>
                  <Text style={styles.montoPresupuesto}>${item.limite}</Text>
                </View>
              ))
            ) : (
              <View style={styles.contenedorVacio}>
                <Text style={styles.textoVacio}>No hay presupuestos configurados</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.botonAgregarCategoria}
            onPress={manejarAgregarCategoria}
          >
            <Text style={styles.textoAgregarCategoria}>+ Agregar Categoría</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.botonConfiguracion}
            onPress={manejarConfiguración}
          >
            <Text style={styles.iconoConfiguracion}>⚙️</Text>
            <Text style={styles.textoConfiguracion}>Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.botonCerrarSesion} 
            onPress={manejarCerrarSesion}
          >
            <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Navegación inferior */}
        <View style={styles.navegacionInferior}>
          <TouchableOpacity 
            style={[styles.itemNavegacion, activeTab === 'home' && styles.itemActivo]}
            onPress={() => onTabChange('home')}
          >
            <Text style={[styles.textoNav, activeTab === 'home' && styles.textoNavActivo]}>Inicio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.itemNavegacion, activeTab === 'balance' && styles.itemActivo]}
            onPress={() => onTabChange('balance')}
          >
            <Text style={[styles.textoNav, activeTab === 'balance' && styles.textoNavActivo]}>Balance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.itemNavegacion, activeTab === 'transactions' && styles.itemActivo]}
            onPress={() => onTabChange('transactions')}
          >
            <Text style={[styles.textoNav, activeTab === 'transactions' && styles.textoNavActivo]}>Transacciones</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.itemNavegacion, activeTab === 'user' && styles.itemActivo]}
            onPress={() => onTabChange('user')}
          >
            <Text style={[styles.textoNav, activeTab === 'user' && styles.textoNavActivo]}>Usuario</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contenedorPantalla: {
    backgroundColor: '#3a3a3a',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    height: 700,
  },
  scrollContenido: {
    paddingBottom: 80,
  },
  tarjetaUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4b5563',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  avatarUsuario: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 24,
  },
  infoUsuario: {
    flex: 1,
  },
  nombreUsuario: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  correoUsuario: {
    color: '#9ca3af',
    fontSize: 14,
  },
  tituloSeccion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  listaPresupuestos: {
    marginBottom: 16,
  },
  itemPresupuesto: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoriaPresupuesto: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  montoPresupuesto: {
    color: '#d1d5db',
    fontSize: 14,
  },
  contenedorVacio: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  textoVacio: {
    color: '#9ca3af',
    fontSize: 16,
  },
  botonAgregarCategoria: {
    backgroundColor: '#4b5563',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoAgregarCategoria: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  botonConfiguracion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b5563',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconoConfiguracion: {
    fontSize: 18,
    marginRight: 8,
  },
  textoConfiguracion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  botonCerrarSesion: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoCerrarSesion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navegacionInferior: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#4b5563',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  itemNavegacion: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  itemActivo: {
    backgroundColor: '#6b7280',
  },
  textoNav: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
  },
  textoNavActivo: {
    color: 'white',
  },
});

export default PantallaPresupuesto;
