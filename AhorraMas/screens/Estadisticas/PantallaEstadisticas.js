import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const StatisticsScreen = ({ transactions = [], activeTab, onTabChange }) => {
  // Calculate expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  const categories = Object.entries(expensesByCategory);
  const colors = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75'];

  const renderCategoryItem = ([category, amount], index) => {
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    
    return (
      <View key={category} style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryLabelContainer}>
            <View 
              style={[
                styles.categoryColorIndicator,
                { backgroundColor: colors[index % colors.length] }
              ]}
            />
            <Text style={styles.categoryLabel}>{category}</Text>
          </View>
          <Text style={styles.categoryAmount}>${amount.toFixed(0)}</Text>
        </View>
        <View style={styles.categoryProgressContainer}>
          <View 
            style={[
              styles.categoryProgress,
              { 
                width: `${percentage}%`,
                backgroundColor: colors[index % colors.length]
              }
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>Estadísticas</Text>
            <TouchableOpacity>
              <Text style={styles.helpText}>Ayuda</Text>
            </TouchableOpacity>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodButtonText}>Mensuales ▼</Text>
            </TouchableOpacity>
          </View>

          {/* Monthly Savings Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Ahorros Mensuales</Text>
            
            {/* Chart Placeholder */}
            {totalExpenses > 0 ? (
              <View style={styles.chartContainer}>
                <View style={styles.chartPlaceholder}>
                  <Text style={styles.chartText}>📊</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyChartContainer}>
                <Text style={styles.emptyChartText}>No hay gastos registrados</Text>
              </View>
            )}
          </View>

          {/* Expenses by Category */}
          <View style={styles.categoryCard}>
            <Text style={styles.categoryCardTitle}>Gastos por Categoría</Text>
            {categories.length > 0 ? (
              <View style={styles.categoryList}>
                {categories.map(renderCategoryItem)}
              </View>
            ) : (
              <View style={styles.emptyCategoryContainer}>
                <Text style={styles.emptyCategoryText}>No hay gastos para mostrar</Text>
              </View>
            )}
          </View>

          {/* Simulate Button */}
          <TouchableOpacity style={styles.simulateButton}>
            <Text style={styles.simulateButtonText}>Simular gastos</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Navigation Placeholder */}
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
  scrollContainer: {
    paddingBottom: 80,
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
  periodSelector: {
    marginBottom: 24,
  },
  periodButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  periodButtonText: {
    color: 'white',
    fontSize: 14,
  },
  chartCard: {
    backgroundColor: '#4b5563',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chartPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  chartText: {
    fontSize: 48,
  },
  emptyChartContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyChartText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  categoryCard: {
    backgroundColor: '#4b5563',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  categoryCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    marginBottom: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },
  categoryAmount: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryProgressContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 4,
  },
  emptyCategoryContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyCategoryText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  simulateButton: {
    backgroundColor: '#4b5563',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
  },
  simulateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
});

export default StatisticsScreen;