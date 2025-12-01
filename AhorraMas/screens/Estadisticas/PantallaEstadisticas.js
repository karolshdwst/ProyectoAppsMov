import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { TransaccionController } from '../../controllers/TransaccionesController';
import { AuthController } from '../../controllers/AuthController';

const transaccionController = new TransaccionController();
const authController = new AuthController();

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      await authController.initialize();
      await transaccionController.initialize();

      const user = await authController.obtenerUsuarioActual();

      if (!user) {
        navigation.replace('Login');
        return;
      }

      const transaccionesDB = await transaccionController.obtenerTransacciones(user.id);
      setTransactions(transaccionesDB);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    cargarDatos();

    transaccionController.addListener(cargarDatos);
    authController.addListener(cargarDatos);

    return () => {
      transaccionController.removeListener(cargarDatos);
      authController.removeListener(cargarDatos);
    };
  }, [cargarDatos]);

  // Filter transactions by selected period
  const filteredTransactions = transactions.filter(t => {
    const fecha = new Date(t.fecha);
    if (selectedPeriod === 'mes') {
      return fecha.getMonth() === selectedMonth && fecha.getFullYear() === selectedYear;
    }
    return fecha.getFullYear() === selectedYear;
  });

  // Calculate expenses by category
  const expensesByCategory = filteredTransactions
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.monto;
      return acc;
    }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  const totalIncome = filteredTransactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const categories = Object.entries(expensesByCategory);
  const colors = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#f59e0b', '#ef4444'];

  // Prepare pie chart data
  const pieChartData = categories.map(([categoria, monto], index) => ({
    name: categoria,
    population: monto,
    color: colors[index % colors.length],
    legendFontColor: '#d1d5db',
    legendFontSize: 12,
  }));

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
        <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity onPress={() => navigation.navigate('MiCuenta')}>
              <Text style={styles.helpText}>Mi Cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <Text style={styles.periodLabel}>Período:</Text>
            <View style={styles.periodButtons}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'mes' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('mes')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === 'mes' && styles.periodButtonTextActive]}>
                  Mensual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'anio' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('anio')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === 'anio' && styles.periodButtonTextActive]}>
                  Anual
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedPeriod === 'mes' && (
            <View style={styles.monthSelector}>
              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => {
                  setSelectedMonth(prev => prev === 0 ? 11 : prev - 1);
                  if (selectedMonth === 0) setSelectedYear(prev => prev - 1);
                }}
              >
                <Text style={styles.monthButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => {
                  setSelectedMonth(prev => prev === 11 ? 0 : prev + 1);
                  if (selectedMonth === 11) setSelectedYear(prev => prev + 1);
                }}
              >
                <Text style={styles.monthButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={[styles.summaryAmount, { color: '#22c55e' }]}>
                ${totalIncome.toFixed(0)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={[styles.summaryAmount, { color: '#ef4444' }]}>
                ${totalExpenses.toFixed(0)}
              </Text>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryAmount, { color: balance >= 0 ? '#22c55e' : '#ef4444' }]}>
                ${balance.toFixed(0)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tasa de Ahorro</Text>
              <Text style={[styles.summaryAmount, { color: '#06b6d4' }]}>
                {savingsRate}%
              </Text>
            </View>
          </View>

          {/* Pie Chart for Expenses by Category */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Gastos por Categoría</Text>
            {pieChartData.length > 0 ? (
              <PieChart
                data={pieChartData}
                width={width - 100}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <View style={styles.emptyChartContainer}>
                <Text style={styles.emptyChartText}>No hay gastos en este período</Text>
              </View>
            )}
          </View>

          {/* Expenses by Category List */}
          <View style={styles.categoryCard}>
            <Text style={styles.categoryCardTitle}>Detalle por Categoría</Text>
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
        </ScrollView>
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
    maxHeight: '95%',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 16,
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
    marginBottom: 16,
  },
  periodLabel: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    backgroundColor: '#4b5563',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: '#06b6d4',
  },
  periodButtonText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    color: '#06b6d4',
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
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
    gap: 16,
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
    marginBottom: 4,
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
  },
  emptyCategoryContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyCategoryText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});

export default StatisticsScreen;