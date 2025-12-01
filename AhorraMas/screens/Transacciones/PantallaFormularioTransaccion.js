import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatabaseService from '../../database/DatabaseService';

const categorias = [
  'Salario',
  'Freelance',
  'Inversión',
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Otros'
];
const categoriasGastos = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Otros'
];
const categoriasIngresos = [
  'Salario',
  'Freelance',
  'Inversión',
  'Otros'
];

const TransactionFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transaction } = route.params || {};

  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [amount, setAmount] = useState(transaction?.monto.toString() || '');
  const [type, setType] = useState(transaction?.tipo || 'ingreso');
  const [category, setCategory] = useState(transaction?.categoria || (transaction?.tipo === 'gasto' ? categoriasGastos[0] : categoriasIngresos[0]));
  const [date, setDate] = useState(transaction?.fecha ? transaction.fecha.split('T')[0] : getLocalDateString());
  const [description, setDescription] = useState(transaction?.descripcion || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.monto.toString());
      setType(transaction.tipo);
      setCategory(transaction.categoria);
      // Extraer solo la parte de la fecha (YYYY-MM-DD) sin la zona horaria
      setDate(transaction.fecha.split('T')[0]);
      setDescription(transaction.descripcion);
    }
  }, [transaction]);

  const handleSubmit = async () => {
    if (!amount || !category || !date) {
      Alert.alert(
        'Error',
        'Por favor completa los campos requeridos (monto, categoría y fecha)',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      const sesion = await DatabaseService.obtenerSesion();

      if (!sesion) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      if (transaction) {
        // Actualizar
        await DatabaseService.actualizarTransaccion(
          transaction.id,
          amount,
          type,
          category,
          `${date}T12:00:00.000Z`, // Agregar hora del mediodía para evitar problemas de zona horaria
          description
        );
        Alert.alert('Éxito', 'Transacción actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        // Crear
        await DatabaseService.crearTransaccion(
          sesion.id,
          amount,
          type,
          category,
          `${date}T12:00:00.000Z`, // Agregar hora del mediodía para evitar problemas de zona horaria
          description
        );
        Alert.alert('Éxito', 'Transacción creada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error al guardar transacción:', error);
      Alert.alert('Error', 'No se pudo guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parsear la fecha directamente desde el formato YYYY-MM-DD sin conversión a Date
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // Mes es 0-indexed
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screenContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>
                {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      type === 'ingreso' && styles.activeTypeButton
                    ]}
                    onPress={() => {
                      setType('ingreso');
                      setCategory(categoriasIngresos[0]);
                    }}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === 'ingreso' && styles.activeTypeButtonText
                    ]}>
                      Ingreso
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      type === 'gasto' && styles.activeTypeButton
                    ]}
                    onPress={() => {
                      setType('gasto');
                      setCategory(categoriasGastos[0]);
                    }}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === 'gasto' && styles.activeTypeButtonText
                    ]}>
                      Gasto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoryContainer}>
                  {(type === 'ingreso' ? categoriasIngresos : categoriasGastos).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        category === cat && styles.selectedCategoryButton
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        category === cat && styles.selectedCategoryButtonText
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha</Text>
                <View style={styles.dateContainer}>
                  <TextInput
                    style={styles.dateInput}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <Text style={styles.dateHelper}>
                  Formato: {formatDate(date || getLocalDateString())}
                </Text>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descripción opcional"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <View style={styles.submitContainer}>
                <TouchableOpacity
                  style={[styles.submitButton, loading && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Guardando...' : (transaction ? 'Actualizar' : 'Agregar')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  screenContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 24,
    padding: 32,
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  titleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  cancelText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencySymbol: {
    color: 'white',
    fontSize: 16,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6b7280',
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: 'white',
  },
  typeButtonText: {
    color: '#d1d5db',
    fontSize: 16,
  },
  activeTypeButtonText: {
    color: '#374151',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: 'white',
  },
  categoryButtonText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: '#374151',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  dateHelper: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  descriptionInput: {
    backgroundColor: '#6b7280',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 80,
  },
  submitContainer: {
    marginTop: 'auto',
  },
  submitButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionFormScreen;