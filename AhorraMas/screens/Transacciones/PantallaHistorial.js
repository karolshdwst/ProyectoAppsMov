import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HistoryScreen = ({ transactions = [], activeTab, onTabChange }) => {
  // Función para formatear fechas de forma amigable
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Comparar solo las fechas (sin horas)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    // Extraer solo la parte de fecha (YYYY-MM-DD) para agrupar correctamente
    const date = transaction.fecha.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort().reverse();

  const renderTransaction = (transaction) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionCategory}>{transaction.categoria}</Text>
        <Text style={styles.transactionDescription}>{transaction.descripcion}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        transaction.tipo === 'ingreso' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {transaction.tipo === 'ingreso' ? '+' : '-'}${transaction.monto}
      </Text>
    </View>
  );

  const renderDateGroup = ({ item: date }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{formatDateHeader(date)}</Text>
      {groupedTransactions[date].map((transaction, index) => (
        <View key={`${transaction.id}-${index}`}>
          {renderTransaction(transaction)}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Historial</Text>
        </View>

        {/* History List */}
        <View style={styles.listContainer}>
          {sortedDates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay historial de transacciones</Text>
            </View>
          ) : (
            <FlatList
              data={sortedDates}
              renderItem={renderDateGroup}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Bottom Navigation Placeholder */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
            onPress={() => onTabChange('home')}
          >
            <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>🏠</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'balance' && styles.activeNavItem]}
            onPress={() => onTabChange('balance')}
          >
            <Text style={[styles.navText, activeTab === 'balance' && styles.activeNavText]}>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'transactions' && styles.activeNavItem]}
            onPress={() => onTabChange('transactions')}
          >
            <Text style={[styles.navText, activeTab === 'transactions' && styles.activeNavText]}>💳</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'user' && styles.activeNavItem]}
            onPress={() => onTabChange('user')}
          >
            <Text style={[styles.navText, activeTab === 'user' && styles.activeNavText]}>👤</Text>
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
  titleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  helpText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    marginBottom: 80,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  transactionItem: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionContent: {
    flex: 1,
  },
  transactionCategory: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#22c55e',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#4b5563',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: '#6b7280',
  },
  navText: {
    fontSize: 20,
  },
  activeNavText: {
    // Active nav styling can be added here
  },
});

export default HistoryScreen;