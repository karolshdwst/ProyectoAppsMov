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
import { useNavigation } from '@react-navigation/native';

const categories = [
  'Salary',
  'Freelance',
  'Investment',
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Otros'
];

const TransactionFormScreen = ({ transaction }) => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [type, setType] = useState(transaction?.type || 'income');
  const [category, setCategory] = useState(transaction?.category || categories[0]);
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(transaction?.description || '');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(transaction.date);
      setDescription(transaction.description);
    }
  }, [transaction]);

  const handleSubmit = () => {
    if (amount && category && date) {
      Alert.alert(
        'Éxito',
        'Transacción guardada exitosamente',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      Alert.alert(
        'Error',
        'Por favor completa los campos requeridos (monto, categoría y fecha)',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
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
                      type === 'income' && styles.activeTypeButton
                    ]}
                    onPress={() => setType('income')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === 'income' && styles.activeTypeButtonText
                    ]}>
                      Ingreso
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      type === 'expense' && styles.activeTypeButton
                    ]}
                    onPress={() => setType('expense')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === 'expense' && styles.activeTypeButtonText
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
                  {categories.map((cat) => (
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
                  <Text style={styles.dateIcon}>📅</Text>
                </View>
                <Text style={styles.dateHelper}>
                  Formato: {formatDate(date || new Date().toISOString().split('T')[0])}
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
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {transaction ? 'Actualizar' : 'Agregar'}
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
    width: '100%',
    maxWidth: 400,
    minHeight: 700,
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
  dateIcon: {
    fontSize: 20,
    marginLeft: 8,
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