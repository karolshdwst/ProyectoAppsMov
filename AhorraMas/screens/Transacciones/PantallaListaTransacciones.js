import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';

import TrashIcon from '../../assets/icons/trash.svg';
import EditIcon from '../../assets/icons/edit.svg';

const TransactionsListScreen = ({
  transactions = [],
  onDelete,
  onEdit,
  onAdd,
  activeTab,
  onTabChange
}) => {

  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const mockTransactions = [
    { id: '1', name: 'Salario', amount: 250, type: 'income', category: 'Salario', date: '2024-06-01' },
    { id: '2', name: 'Supermercado', amount: 75, type: 'expense', category: 'Comida', date: '2024-06-02' },
    { id: '3', name: 'Venta', amount: 100, type: 'income', category: 'Ventas', date: '2024-06-03' },
    { id: '4', name: 'Restaurante', amount: 50, type: 'expense', category: 'Comida', date: '2024-06-04' },
  ];

  const allTransactions = transactions.length ? transactions : mockTransactions;

  const categories = Array.from(new Set(allTransactions.map(t => t.category)));

  const filteredTransactions = allTransactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar Transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete && onDelete(id) }
      ]
    );
  };

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

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      
      {/* IZQUIERDA */}
      <View style={styles.leftSection}>
        <Text style={styles.transactionText}>{item.name}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>

      {/* DERECHA: monto + íconos */}
      <View style={styles.rightSection}>
        <Text
          style={[
            styles.transactionAmount,
            item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
          ]}
        >
          {item.type === 'income' ? '+' : '-'}${item.amount}
        </Text>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <TrashIcon width={20} height={20}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEdit && onEdit(item)}>
          <EditIcon width={20} height={20}/>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Transacciones</Text>
          <TouchableOpacity>
            <Text style={styles.helpText}>Ayuda</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.typeFilters}>
            {renderFilterButton('all', 'Todo')}
            {renderFilterButton('income', 'Ingresos')}
            {renderFilterButton('expense', 'Gastos')}
          </View>

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

            {categories.slice(0, 3).map(cat => (
              <TouchableOpacity
                key={cat}
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

        {/* LISTA */}
        <View style={styles.listContainer}>
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={(
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay transacciones para mostrar.</Text>
              </View>
            )}
          />
        </View>

        {/* Botón agregar */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
        >
          <Text style={styles.addButtonText}>+ Agregar Transacción</Text>
        </TouchableOpacity>

        {/* Navegación inferior */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
            onPress={() => onTabChange('home')}
          >
            <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'balance' && styles.activeNavItem]}
            onPress={() => onTabChange('balance')}
          >
            <Text style={[styles.navText, activeTab === 'balance' && styles.activeNavText]}>Balance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'transactions' && styles.activeNavItem]}
            onPress={() => onTabChange('transactions')}
          >
            <Text style={[styles.navText, activeTab === 'transactions' && styles.activeNavText]}>Transacciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'user' && styles.activeNavItem]}
            onPress={() => onTabChange('user')}
          >
            <Text style={[styles.navText, activeTab === 'user' && styles.activeNavText]}>Usuario</Text>
          </TouchableOpacity>
        </View>

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

  titleText: { color: 'white', fontSize: 20, fontWeight: '600' },
  helpText: { color: '#9ca3af', fontSize: 16 },

  filtersContainer: { marginBottom: 24 },
  typeFilters: { flexDirection: 'row', gap: 8, marginBottom: 12 },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6b7280',
  },
  activeFilterButton: { backgroundColor: 'white' },

  filterButtonText: { color: '#d1d5db', fontSize: 14 },
  activeFilterButtonText: { color: '#374151' },

  categoryFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#6b7280',
  },
  activeCategoryButton: { backgroundColor: '#9ca3af' },

  categoryButtonText: { color: '#d1d5db', fontSize: 12 },
  activeCategoryButtonText: { color: '#374151' },

  listContainer: { flex: 1, marginBottom: 16 },
  listContent: { gap: 12 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: { color: '#9ca3af', fontSize: 16 },

  transactionItem: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flex: 1,
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 120, // ✅ ESTO FIJA EL ANCHO Y ALINEA TODO
    justifyContent: 'flex-end',
  },

  transactionText: { color: 'white', fontSize: 16, fontWeight: '600' },
  transactionCategory: { color: '#d1d5db', fontSize: 13 },
  transactionDate: { color: '#9ca3af', fontSize: 12 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  incomeAmount: { color: '#22c55e' },
  expenseAmount: { color: '#ef4444' },

  addButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: '#374151', fontSize: 16, fontWeight: '600' },

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

  activeNavItem: { backgroundColor: '#6b7280' },

  navText: { fontSize: 12, color: '#d1d5db', textAlign: 'center' },
  activeNavText: { color: 'white' },
});

export default TransactionsListScreen;
