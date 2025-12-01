import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseService from '../../database/DatabaseService';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const TransactionsListScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar transacciones al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      cargarTransacciones();
    }, [])
  );

  const cargarTransacciones = async () => {
    try {
      setLoading(true);
      const sesion = await DatabaseService.obtenerSesion();
      if (sesion) {
        const data = await DatabaseService.obtenerTransaccionesPorUsuario(sesion.id);
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(transactions.map(t => t.categoria)));

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.tipo !== filterType) return false;
    if (filterCategory !== 'all' && t.categoria !== filterCategory) return false;
    // Filtro de fecha simple (coincidencia exacta de string YYYY-MM-DD)
    if (filterDate && !t.fecha.startsWith(filterDate)) return false;
    return true;
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar Transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.eliminarTransaccion(id);
              cargarTransacciones(); // Recargar lista
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar la transacción');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (transaction) => {
    navigation.navigate('FormularioTransaccion', { transaction });
  };

  const renderTransaction = ({ item: transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionCategory}>{transaction.categoria}</Text>
          <View style={[
            styles.typeBadge,
            transaction.tipo === 'ingreso' ? styles.incomeBadge : styles.expenseBadge
          ]}>
            <Text style={styles.typeBadgeText}>
              {transaction.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
            </Text>
          </View>
        </View>
        <Text style={styles.transactionDescription}>{transaction.descripcion}</Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.fecha).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.transactionActions}>
        <Text style={[
          styles.transactionAmount,
          transaction.tipo === 'ingreso' ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {transaction.tipo === 'ingreso' ? '+' : '-'}${transaction.monto}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(transaction)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(transaction.id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterButton = (type, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.activeFilterButton
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filterType === type && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Transacciones</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MiCuenta')}>
            <Text style={styles.helpText}>Mi Cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.typeFilters}>
            {renderFilterButton('all', 'Todas')}
            {renderFilterButton('ingreso', 'Ingresos')}
            {renderFilterButton('gasto', 'Gastos')}
          </View>

          {/* Category Filter - Simplified as buttons for now */}
          <View style={styles.categoryFilters}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                filterCategory === 'all' && styles.activeCategoryButton
              ]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[
                styles.categoryButtonText,
                filterCategory === 'all' && styles.activeCategoryButtonText
              ]}>
                Todas las categorías
              </Text>
            </TouchableOpacity>

            {categories.slice(0, 3).map((cat, index) => (
              <TouchableOpacity
                key={`${cat}-${index}`}
                style={[
                  styles.categoryButton,
                  filterCategory === cat && styles.activeCategoryButton
                ]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  filterCategory === cat && styles.activeCategoryButtonText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por fecha (YYYY-MM-DD):</Text>
          <TextInput
            style={styles.filterInput}
            value={filterDate}
            onChangeText={setFilterDate}
            placeholder="2025-11-29"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Transactions List */}
        <View style={styles.listContainer}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Cargando...' : 'No hay transacciones'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('FormularioTransaccion')}
        >
          <Text style={styles.addButtonText}>+ Agregar Transacción</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  screenContainer: {
    backgroundColor: '#3a3a3a',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    height: 700,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
  filtersContainer: {
    marginBottom: 24,
  },
  typeFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6b7280',
  },
  activeFilterButton: {
    backgroundColor: 'white',
  },
  filterButtonText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: '#374151',
  },
  categoryFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#6b7280',
  },
  activeCategoryButton: {
    backgroundColor: '#9ca3af',
  },
  categoryButtonText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  activeCategoryButtonText: {
    color: '#374151',
  },
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  transactionItem: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  transactionCategory: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  incomeBadge: {
    backgroundColor: '#16a34a',
  },
  expenseBadge: {
    backgroundColor: '#dc2626',
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  transactionDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  transactionDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  transactionActions: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  incomeAmount: {
    color: '#22c55e',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    borderRadius: 12,
    padding: 8,

    color: '#d1d5db',
  },
  deleteButtonText: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 5,
    color: '#ffffffff',
  },
  addButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#4b5563',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: '#6b7280',
  },
  navText: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
  },
  activeNavText: {
    color: 'white',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterInput: {
    backgroundColor: '#6b7280',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterLabel: {
    color: '#9ca3af',
    marginBottom: 8,
  },
});

export default TransactionsListScreen;