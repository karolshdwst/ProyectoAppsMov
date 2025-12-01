import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PresupuestoController } from '../../controllers/PresupuestoController';

const controller = new PresupuestoController();

const PantallaPresupuestoIntegrada = ({ usuarioId = 1 }) => {
  const navigation = useNavigation();
  const [presupuestos, setPresupuestos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [categoriaInput, setCategoriaInput] = useState('');
  const [montoInput, setMontoInput] = useState('');
  const [notificaciones, setNotificaciones] = useState([]);
  const mountedRef = useRef(false);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    mountedRef.current = true;

    const init = async () => {
      try {
        await controller.initialize();
        controller.addListener(refreshFromDB);
        await controller.actualizarTodosLosPresupuestos(usuarioId);
        await refreshFromDB();

        refreshIntervalRef.current = setInterval(async () => {
          try {
            await controller.actualizarTodosLosPresupuestos(usuarioId);
            await refreshFromDB();
          } catch (e) {
          }
        }, 10_000);
      } catch (error) {
        console.error('Inicialización controller/DB falló', error);
        Alert.alert('Error', 'No se pudo inicializar la base de datos de presupuestos.');
      }
    };

    init();

    return () => {
      isMounted = false;
      mountedRef.current = false;
      controller.removeListener(refreshFromDB);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  const refreshFromDB = async () => {
    try {
      const all = await controller.obtenerPresupuestos(usuarioId, mesFiltro, anioFiltro);
      const filtered = categoriaFiltro && categoriaFiltro.trim() !== ''
        ? all.filter(p => p.categoria.toLowerCase().includes(categoriaFiltro.toLowerCase()))
        : all;
      setPresupuestos(filtered);
    } catch (error) {
      console.error('Error al refrescar presupuestos', error);
    }
  };

  useEffect(() => {
    refreshFromDB();
  }, [categoriaFiltro, mesFiltro, anioFiltro]);

  useEffect(() => {
  const nuevas = [];

  presupuestos.forEach(p => {
    const porc = (p.montoGastado / (p.montoLimite || 1)) * 100;

    if (porc >= 100) {
      nuevas.push({
        tipo: 'error',
        mensaje: `🚨 Presupuesto de "${p.categoria}" EXCEDIDO`
      });
    } else if (porc >= 80) {
      nuevas.push({
        tipo: 'warning',
        mensaje: `⚠️ Presupuesto de "${p.categoria}" está al ${porc.toFixed(0)}%`
      });
    }
  });

  setNotificaciones(nuevas);
}, [presupuestos]);

  const abrirCrear = () => {
    setEditando(null);
    setCategoriaInput('');
    setMontoInput('');
    setModalVisible(true);
  };

  // abrir modal para editar
  const abrirEditar = (item) => {
    setEditando(item);
    setCategoriaInput(item.categoria);
    setMontoInput(String(item.montoLimite));
    setModalVisible(true);
  };

  // guardar (crear o actualizar)
  const guardarPresupuesto = async () => {
    try {
      if (!categoriaInput || categoriaInput.trim() === '') {
        Alert.alert('Validación', 'La categoría es obligatoria');
        return;
      }
      const monto = parseFloat(montoInput);
      if (isNaN(monto) || monto <= 0) {
        Alert.alert('Validación', 'Ingresa un monto válido mayor a 0');
        return;
      }

      if (editando) {
        // actualizar (solo categoría y monto)
        await controller.actualizarPresupuesto(editando.id, categoriaInput, monto);
      } else {
        // crear (usa los filtros de mes/anio actuales para el presupuesto)
        await controller.crearPresupuesto(usuarioId, categoriaInput, monto, mesFiltro, anioFiltro);
      }

      setModalVisible(false);
      await controller.actualizarTodosLosPresupuestos(usuarioId);
      await refreshFromDB();
    } catch (error) {
      console.error('Guardar presupuesto error', error);
      Alert.alert('Error', 'No se pudo guardar el presupuesto. Revisa la consola.');
    }
  };

  const confirmarEliminar = (id) => {
    Alert.alert(
      'Eliminar Presupuesto',
      '¿Estás seguro de eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await controller.eliminarPresupuesto(id);
              await refreshFromDB();
            } catch (error) {
              console.error('Eliminar presupuesto error', error);
              Alert.alert('Error', 'No se pudo eliminar el presupuesto.');
            }
          }
        }
      ]
    );
  };

  // render item
  const renderItem = ({ item }) => (
    <View style={styles.itemPresupuesto}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.categoriaPresupuesto}>{item.categoria}</Text>
          <Text style={styles.montoPresupuesto}>Límite: ${Number(item.montoLimite).toFixed(2)}</Text>
          <Text style={styles.montoGastado}>Gastado: ${Number(item.montoGastado || 0).toFixed(2)}</Text>
          {/* Condicional si el monto gastado es mayor al limite mostrarnotificacion */}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.actionButton]} onPress={() => abrirEditar(item)}>
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#b91c1c' }]} onPress={() => confirmarEliminar(item.id)}>
            <Text style={styles.actionText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* indicador simple de estado */}
      <View style={{ marginTop: 8 }}>
        {item.excedioLimite && (
          <Text style={{ color: '#f87171' }}>Excedido</Text>
        )}
        {!item.excedioLimite && item.montoGastado / (item.montoLimite || 1) >= 0.8 && (
          <Text style={{ color: '#fde68a' }}>Cerca del límite</Text>
        )}
      </View>
    </View>
  );

  const cambiarMes = (offset) => {
    let m = Number(mesFiltro) + offset;
    let y = Number(anioFiltro);
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMesFiltro(m);
    setAnioFiltro(y);
  };

  const MostrarNotificaciones = () => {
  if (notificaciones.length === 0) return null;

  return (
    <View style={styles.notificacionBox}>
      {notificaciones.map((n, i) => (
        <View
          key={i}
          style={[
            styles.notificacionItem,
            n.tipo === 'error'
              ? { backgroundColor: '#dc2626' }
              : { backgroundColor: '#facc15' }
          ]}
        >
          <Text style={styles.notificacionTexto}>{n.mensaje}</Text>
        </View>
      ))}
    </View>
  );
};

  return (
    <SafeAreaView style={styles.contenedorPrincipal}>
      <View style={styles.contenedorPantalla}>
        <ScrollView contentContainerStyle={styles.scrollContenido} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <MostrarNotificaciones />
            <Text style={styles.titleText}>Presupuestos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MiCuenta')}>
              <Text style={styles.helpText}>Mi Cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* filtros */}
          <View style={styles.filtrosContainer}>
            <TextInput
              placeholder="Filtrar por categoría"
              placeholderTextColor="#9ca3af"
              value={categoriaFiltro}
              onChangeText={setCategoriaFiltro}
              style={styles.inputFiltro}
            />

            <View style={styles.fechaFiltroRow}>
              <TouchableOpacity style={styles.mesBtn} onPress={() => cambiarMes(-1)}>
                <Text style={styles.mesBtnText}>◀</Text>
              </TouchableOpacity>

              <View style={styles.mesAnioBox}>
                <Text style={styles.mesAnioText}>Mes: {mesFiltro} / {anioFiltro}</Text>
              </View>

              <TouchableOpacity style={styles.mesBtn} onPress={() => cambiarMes(1)}>
                <Text style={styles.mesBtnText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.tituloSeccion}>Presupuestos Mensuales</Text>

          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity style={styles.botonAgregarCategoria} onPress={abrirCrear}>
              <Text style={styles.textoAgregarCategoria}>+ Agregar Presupuesto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listaPresupuestos}>
            {presupuestos.length > 0 ? (
              <FlatList
                data={presupuestos}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.contenedorVacio}>
                <Text style={styles.textoVacio}>No hay presupuestos configurados</Text>
              </View>
            )}
          </View>





          <View style={{ height: 120 }} />
        </ScrollView>
      </View>

      {/* Modal Crear / Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>{editando ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</Text>

            <TextInput
              placeholder="Categoría"
              placeholderTextColor="#9ca3af"
              value={categoriaInput}
              onChangeText={setCategoriaInput}
              style={styles.input}
            />

            <TextInput
              placeholder="Monto límite"
              placeholderTextColor="#9ca3af"
              value={montoInput}
              onChangeText={setMontoInput}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.botonModal, { backgroundColor: '#4b5563', flex: 1 }]} onPress={() => { setModalVisible(false); }}>
                <Text style={{ color: 'white', textAlign: 'center' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.botonModal, { flex: 1 }]} onPress={guardarPresupuesto}>
                <Text style={{ color: 'white', textAlign: 'center' }}>{editando ? 'Guardar' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notificacionBox: {
    marginBottom: 12,
    padding: 4,
    gap: 6,
  },

  notificacionItem: {
    padding: 10,
    borderRadius: 8,
  },

  notificacionTexto: {
    color: 'black',
    fontWeight: '600',
  },
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
    padding: 20,
    width: '100%',
    maxWidth: 700,
    maxHeight: '95%',
  },
  scrollContenido: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  helpText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  filtrosContainer: {
    marginBottom: 12,
  },
  inputFiltro: {
    backgroundColor: '#4b5563',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  fechaFiltroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mesBtn: {
    padding: 8,
    backgroundColor: '#4b5563',
    borderRadius: 8,
  },
  mesBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  mesAnioBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4b5563',
  },
  mesAnioText: {
    color: 'white',
  },
  tituloSeccion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 12,
  },
  listaPresupuestos: {
    marginBottom: 16,
  },
  itemPresupuesto: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 12,
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
  montoGastado: {
    color: '#f3f4f6',
    fontSize: 13,
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
    backgroundColor: '#10b981',
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  textoConfiguracion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  botonCerrarSesion: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoCerrarSesion: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // modal
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#3a3a3bff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  botonModal: {
    backgroundColor: '#0ea5a4',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  }
});

export default PantallaPresupuestoIntegrada;
