import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, } from 'react-native';
const PantallaMensual = ({ onLogout, activeTab, onTabChange }) => {
    const [presupuestos, setPresupuestos] = useState([]);
    const [categoria, setCategoria] = useState('');
    const [limite, setLimite] = useState('');
    const [editandoId, setEditandoId] = useState(null);
  
    const limpiarFormulario = () => {
      setCategoria('');
      setLimite('');
      setEditandoId(null);
    };
  
    const manejarGuardar = () => {
      if (!categoria || !limite) {
        Alert.alert('Error', 'Completa todos los campos');
        return;
      }
      if (editandoId) {
        // Actualizar presupuesto existente
        const actualizado = presupuestos.map(item =>
          item.id === editandoId ? { ...item, categoria, limite } : item
        );
        setPresupuestos(actualizado);
        Alert.alert('Actualizado', 'Presupuesto actualizado con éxito');
      } else {
        // Crear nuevo presupuesto
        const nuevo = {
          id: Date.now().toString(),
          categoria,
          limite,
        };
        setPresupuestos([...presupuestos, nuevo]);
        Alert.alert('Agregado', 'Presupuesto agregado con éxito');
      }
  
      limpiarFormulario();
    };
  
    const manejarEditar = (id) => {
      const seleccionado = presupuestos.find(item => item.id === id);
      setCategoria(seleccionado.categoria);
      setLimite(seleccionado.limite.toString());
      setEditandoId(id);
    };
  
    const manejarEliminar = (id) => {
      Alert.alert(
        'Eliminar Presupuesto',
        '¿Estás seguro de eliminar este presupuesto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              setPresupuestos(presupuestos.filter(item => item.id !== id));
            },
          },
        ]
      );
    };
  
    const manejarCerrarSesion = () => {
      Alert.alert(
        'Cerrar Sesión',
        '¿Deseas cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar Sesión', style: 'destructive', onPress: onLogout },
        ]
      );
    };
  
    return (
      <SafeAreaView style={styles.contenedorPrincipal}>
        <View style={styles.contenedorPantalla}>
          <ScrollView contentContainerStyle={styles.scrollContenido}>
            {/* Tarjeta Usuario */}
            <View style={styles.tarjetaUsuario}>
              <View style={styles.avatarUsuario}>
                <Text style={styles.avatarTexto}>Perfil</Text>
              </View>
              <View style={styles.infoUsuario}>
                <Text style={styles.nombreUsuario}>Usuario</Text>
                <Text style={styles.correoUsuario}>usuario@ahorra.app</Text>
              </View>
            </View>
            <Text style={styles.tituloSeccion}>Gestión de Presupuestos</Text>

          {/* Formulario */}
          <View style={styles.formulario}>
            <TextInput
              placeholder="Categoría"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={categoria}
              onChangeText={setCategoria}
            />
            <TextInput
              placeholder="Límite mensual ($)"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              keyboardType="numeric"
              value={limite}
              onChangeText={setLimite}
            />

            <TouchableOpacity
              style={styles.botonAgregarCategoria}
              onPress={manejarGuardar}
            >
              <Text style={styles.textoAgregarCategoria}>
                {editandoId ? 'Actualizar' : '+ Agregar'}
              </Text>
            </TouchableOpacity>
          </View>
           {/* Lista de presupuestos */}
           <View style={styles.listaPresupuestos}>
            {presupuestos.length > 0 ? (
              presupuestos.map(item => (
                <View key={item.id} style={styles.itemPresupuesto}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.categoriaPresupuesto}>{item.categoria}</Text>
                    <Text style={styles.montoPresupuesto}>${item.limite}</Text>
                  </View>
                  <View style={styles.acciones}>
                    <TouchableOpacity onPress={() => manejarEditar(item.id)}>
                      <Text style={styles.textoAccionEditar}>Editar</Text>
                      </TouchableOpacity>
                    <TouchableOpacity onPress={() => manejarEliminar(item.id)}>
                      <Text style={styles.textoAccionEliminar}> Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.contenedorVacio}>
                <Text style={styles.textoVacio}>No hay presupuestos configurados</Text>
              </View>
            )}
          </View>

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
            <Text style={[styles.textoNav, activeTab === 'home' && styles.textoNavActivo]}>
              Inicio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.itemNavegacion, activeTab === 'balance' && styles.itemActivo]}
            onPress={() => onTabChange('balance')}
          >
            <Text style={[styles.textoNav, activeTab === 'balance' && styles.textoNavActivo]}>
              Balance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.itemNavegacion, activeTab === 'transactions' && styles.itemActivo]}
            onPress={() => onTabChange('transactions')}
          >
            <Text style={[styles.textoNav, activeTab === 'transactions' && styles.textoNavActivo]}>
              Transacciones
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.itemNavegacion, activeTab === 'user' && styles.itemActivo]}
            onPress={() => onTabChange('user')}
          >
            <Text style={[styles.textoNav, activeTab === 'user' && styles.textoNavActivo]}>
              Usuario
            </Text>
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
    avatarTexto: { fontSize: 24 },
    infoUsuario: { flex: 1 },
    nombreUsuario: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    correoUsuario: { color: '#9ca3af', fontSize: 14 },
    tituloSeccion: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 16,
    },
    formulario: { marginBottom: 24 },
    input: {
      backgroundColor: '#4b5563',
      borderRadius: 12,
      padding: 12,
      color: 'white',
      marginBottom: 12,
    },
    listaPresupuestos: { marginBottom: 16 },
    itemPresupuesto: {
      backgroundColor: '#4b5563',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    categoriaPresupuesto: { color: 'white', fontSize: 16, fontWeight: '500' },
    montoPresupuesto: { color: '#d1d5db', fontSize: 14 },
    acciones: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      gap: 16,
    },
    textoAccionEditar: { color: '#3b82f6', fontSize: 14 },
    textoAccionEliminar: { color: '#ef4444', fontSize: 14 },
    contenedorVacio: { alignItems: 'center', paddingVertical: 48 },
    textoVacio: { color: '#9ca3af', fontSize: 16 },
    botonAgregarCategoria: {
      backgroundColor: '#4b5563',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    textoAgregarCategoria: { color: 'white', fontSize: 16, fontWeight: '500' },
    botonCerrarSesion: {
      backgroundColor: '#dc2626',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    textoCerrarSesion: { color: 'white', fontSize: 16, fontWeight: '600' },
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
      borderRadius: 12,
    },
    itemActivo: { backgroundColor: '#6b7280' },
    textoNav: { fontSize: 12, color: '#d1d5db', textAlign: 'center' },
    textoNavActivo: { color: 'white' },
});

export default PantallaMensual