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
import { BarChart, LineChart } from 'react-native-chart-kit';
import React, { useEffect, useState, useCallback } from "react";
import { TransaccionController } from "../../controllers/TransaccionesController";
import { PresupuestoController } from "../../controllers/PresupuestoController";
import { AuthController } from "../../controllers/AuthController";

const transaccionController = new TransaccionController();
const presupuestoController = new PresupuestoController();
const authController = new AuthController();

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
    const navigation = useNavigation();
    
    const [usuario, setUsuario] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todos");


    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            
            await authController.initialize();
            await transaccionController.initialize();
            await presupuestoController.initialize();

            const user = await authController.obtenerUsuarioActual();
            
            if (!user) {
                navigation.replace('Login');
                return;
            }

            setUsuario(user);

            // Obtener transacciones del usuario
            const transaccionesDB = await transaccionController.obtenerTransacciones(user.id);
            setTransactions(transaccionesDB);

            // Obtener presupuestos del usuario
            const presupuestosDB = await presupuestoController.obtenerPresupuestosMesActual(user.id);
            setBudgets(presupuestosDB);

            // Obtener estadísticas del mes actual
            const stats = await transaccionController.obtenerEstadisticasMensuales(user.id);
            setEstadisticas(stats);

            console.log('Datos cargados:', {
                transacciones: transaccionesDB.length,
                presupuestos: presupuestosDB.length,
                estadisticas: stats
            });

        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    }, [navigation]);


    useEffect(() => {
        cargarDatos();

        
        transaccionController.addListener(cargarDatos);
        presupuestoController.addListener(cargarDatos);
        authController.addListener(cargarDatos);

        return () => {
            transaccionController.removeListener(cargarDatos);
            presupuestoController.removeListener(cargarDatos);
            authController.removeListener(cargarDatos);
        };
    }, [cargarDatos]);

    const totalIncome = transactions
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

    const totalExpense = transactions
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0);

    const balance = totalIncome - totalExpense;
    const savings = balance * 0.4;

   
    const meses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

    const ingresosPorMes = new Array(12).fill(0);
    const egresosPorMes = new Array(12).fill(0);

    transactions.forEach(t => {
        const fecha = new Date(t.fecha);
        const mes = fecha.getMonth();
        
        if (t.tipo === "ingreso") {
            ingresosPorMes[mes] += t.monto;
        }
        if (t.tipo === "gasto") {
            egresosPorMes[mes] += t.monto;
        }
    });

    let dataFiltrada = [];

    if (filtro === "ingresos") {
        dataFiltrada = [
            { data: ingresosPorMes, color: () => `#22c55e` }
        ];
    } else if (filtro === "egresos") {
        dataFiltrada = [
            { data: egresosPorMes, color: () => `#ef4444` }
        ];
    } else {
        dataFiltrada = [
            { data: ingresosPorMes, color: () => `#22c55e` },
            { data: egresosPorMes, color: () => `#ef4444` },
        ];
    }

    
    const renderBudgetItem = (budget, index) => {
        const percentage = (budget.montoGastado / budget.montoLimite) * 100;
        const isOverBudget = percentage > 100;

        return (
            <View key={index} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{budget.categoria}</Text>
                    <Text style={[styles.budgetAmount, isOverBudget && styles.overBudgetAmount]}>
                        ${budget.montoGastado.toFixed(0)} / ${budget.montoLimite.toFixed(0)}
                    </Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: isOverBudget ? '#ef4444' : '#06b6d4'
                            }
                        ]}
                    />
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#06b6d4" />
                    <Text style={styles.loadingText}>Cargando datos...</Text>
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
                 
                    <View style={styles.header}>
                        <Text style={styles.titleText}>Inicio</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('MiCuenta')}>
                            <Text style={styles.helpText}>Mi Cuenta</Text>
                        </TouchableOpacity>
                    </View>

                    
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Balance</Text>
                        <Text style={styles.balanceAmount}>${balance.toFixed(0)}</Text>

                        <View style={styles.balanceDetails}>
                            <View style={styles.balanceDetailItem}>
                                <Text style={styles.balanceDetailLabel}>Gastos</Text>
                                <Text style={styles.balanceDetailAmount}>${totalExpense.toFixed(0)}</Text>
                            </View>
                            <View style={styles.balanceDetailItem}>
                                <Text style={styles.balanceDetailLabel}>Ahorro</Text>
                                <Text style={styles.balanceDetailAmount}>${savings.toFixed(0)}</Text>
                            </View>
                        </View>
                    </View>

                   
                    <View style={styles.savingsContainer}>
                        <View style={styles.savingsHeader}>
                            <Text style={styles.savingsTitle}>Línea de Ahorro</Text>
                            <Text style={styles.savingsAmount}>${savings.toFixed(0)} →</Text>
                        </View>
                        <View style={styles.savingsProgressContainer}>
                            <View
                                style={[
                                    styles.savingsProgress,
                                    { width: `${Math.min((savings / (balance || 1)) * 100, 100)}%` }
                                ]}
                            />
                        </View>
                    </View>

                   
                    <View style={styles.comparisonCard}>
                        <Text style={styles.comparisonTitle}>Comparación Mensual</Text>

                        <View style={styles.comparisonItem}>
                            <View style={styles.comparisonHeader}>
                                <Text style={styles.comparisonLabel}>Ingresos</Text>
                                <Text style={styles.comparisonAmount}>${totalIncome.toFixed(0)}</Text>
                            </View>
                            <View style={styles.comparisonBarContainer}>
                                <View style={[
                                    styles.comparisonBar, 
                                    { 
                                        backgroundColor: '#22c55e',
                                        width: '100%'
                                    }
                                ]} />
                            </View>
                        </View>

                        <View style={styles.comparisonItem}>
                            <View style={styles.comparisonHeader}>
                                <Text style={styles.comparisonLabel}>Gastos</Text>
                                <Text style={styles.comparisonAmount}>${totalExpense.toFixed(0)}</Text>
                            </View>
                            <View style={styles.comparisonBarContainer}>
                                <View
                                    style={[
                                        styles.comparisonBar,
                                        {
                                            backgroundColor: '#ef4444',
                                            width: `${Math.min((totalExpense / (totalIncome || 1)) * 100, 100)}%`
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Budget Alerts */}
                    {budgets.length > 0 && (
                        <View style={styles.budgetContainer}>
                            <Text style={styles.budgetTitle}>Estado de Presupuestos</Text>
                            <View style={styles.budgetList}>
                                {budgets.slice(0, 3).map(renderBudgetItem)}
                            </View>
                        </View>
                    )}

                 
                    <View style={{ marginBottom: 40 }}>
                        <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
                            Gráfica de Ingresos y Gastos
                        </Text>

                      
                        <View style={{ marginBottom: 12, padding: 12, backgroundColor: '#4b5563', borderRadius: 8 }}>
                            <Text style={{ color: '#d1d5db', fontSize: 12 }}>
                                Total de transacciones: {transactions.length}
                            </Text>
                            <Text style={{ color: '#22c55e', fontSize: 12 }}>
                                Ingresos totales: ${totalIncome.toFixed(0)}
                            </Text>
                            <Text style={{ color: '#ef4444', fontSize: 12 }}>
                                Gastos totales: ${totalExpense.toFixed(0)}
                            </Text>
                        </View>

                      
                        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filtro === "ingresos" && styles.filterButtonActive
                                ]}
                                onPress={() => setFiltro("ingresos")}
                            >
                                <Text style={{ color: "white" }}>Ingresos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filtro === "egresos" && styles.filterButtonActive
                                ]}
                                onPress={() => setFiltro("egresos")}
                            >
                                <Text style={{ color: "white" }}>Gastos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterButton,
                                    filtro === "todos" && styles.filterButtonActive
                                ]}
                                onPress={() => setFiltro("todos")}
                            >
                                <Text style={{ color: "white" }}>Ambos</Text>
                            </TouchableOpacity>
                        </View>

                        {transactions.length > 0 ? (
                            <>
                              
                                <Text style={{ color: "#d1d5db", marginBottom: 6 }}>Línea</Text>
                                <LineChart
                                    data={{
                                        labels: meses,
                                        datasets: dataFiltrada
                                    }}
                                    width={width - 100}
                                    height={220}
                                    fromZero
                                    bezier
                                    chartConfig={{
                                        backgroundGradientFrom: "#3a3a3a",
                                        backgroundGradientTo: "#3a3a3a",
                                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                        labelColor: () => "#d1d5db",
                                    }}
                                    style={{ borderRadius: 16 }}
                                />
                            </>
                        ) : (
                            <View style={{ padding: 40, backgroundColor: '#4b5563', borderRadius: 16, alignItems: 'center' }}>
                                <Text style={{ color: '#9ca3af', fontSize: 16, textAlign: 'center' }}>
                                    No hay transacciones registradas
                                </Text>
                                <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                                    Agrega tu primera transacción para ver las gráficas
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    filterButton: {
        backgroundColor: "#4b5563",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    filterButtonActive: {
        backgroundColor: "#6b7280",
    },
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
        height: 'auto',
        maxHeight: '95%',
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
    scrollContainer: {
        paddingBottom: 80,
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
    helpText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    balanceCard: {
        backgroundColor: '#6b7280',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    balanceLabel: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceAmount: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    balanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    balanceDetailItem: {
        flex: 1,
    },
    balanceDetailLabel: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 4,
    },
    balanceDetailAmount: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    savingsContainer: {
        marginBottom: 24,
    },
    savingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    savingsTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    savingsAmount: {
        color: '#9ca3af',
        fontSize: 14,
    },
    savingsProgressContainer: {
        height: 32,
        backgroundColor: '#6b7280',
        borderRadius: 16,
        overflow: 'hidden',
    },
    savingsProgress: {
        height: '100%',
        backgroundColor: '#9ca3af',
        borderRadius: 16,
    },
    comparisonCard: {
        backgroundColor: '#6b7280',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    comparisonTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    comparisonItem: {
        marginBottom: 16,
    },
    comparisonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    comparisonLabel: {
        color: '#9ca3af',
        fontSize: 14,
    },
    comparisonAmount: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    comparisonBarContainer: {
        height: 12,
        backgroundColor: '#4b5563',
        borderRadius: 6,
        overflow: 'hidden',
    },
    comparisonBar: {
        height: '100%',
        borderRadius: 6,
    },
    budgetContainer: {
        marginBottom: 24,
    },
    budgetTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    budgetList: {
        gap: 8,
    },
    budgetItem: {
        backgroundColor: '#6b7280',
        borderRadius: 12,
        padding: 16,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    budgetCategory: {
        color: '#d1d5db',
        fontSize: 14,
    },
    budgetAmount: {
        color: '#9ca3af',
        fontSize: 14,
    },
    overBudgetAmount: {
        color: '#f87171',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#4b5563',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});

export default DashboardScreen;