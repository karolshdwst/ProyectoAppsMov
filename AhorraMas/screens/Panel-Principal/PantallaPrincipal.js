import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import React, { useEffect, useState, useCallback } from "react";
import transaccionController from '../../controllers/TransaccionesController';
import presupuestoController from '../../controllers/PresupuestoController';
import authController from '../../controllers/AuthController';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
    const navigation = useNavigation();

    const [usuario, setUsuario] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todos");

    // Estados para Meta de Ahorro
    const [metaAhorro, setMetaAhorro] = useState(0);
    const [porcentajeAhorro, setPorcentajeAhorro] = useState(100);
    const [modalMetaVisible, setModalMetaVisible] = useState(false);
    const [nuevaMetaInput, setNuevaMetaInput] = useState('');
    const [nuevoPorcentajeInput, setNuevoPorcentajeInput] = useState('100');


    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);

            // Solo inicializar AuthController que necesita cargar la sesión
            await authController.initialize();

            const user = await authController.obtenerUsuarioActual();

            if (!user) {
                navigation.replace('Login');
                return;
            }

            setUsuario(user);
            setMetaAhorro(user.metaAhorro || 0);
            setPorcentajeAhorro(user.porcentajeAhorro || 100);

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
    }, []); // Sin dependencias para evitar que cambie la referencia


    useEffect(() => {
        cargarDatos();
        // Removidos los listeners automáticos - solo actualización manual con botón 🔄
    }, [cargarDatos]);

    const totalIncome = transactions
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

    const totalExpense = transactions
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0);

    const balance = totalIncome - totalExpense;
    const savings = balance * (porcentajeAhorro / 100);


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


    const guardarMeta = async () => {
        try {
            const meta = parseFloat(nuevaMetaInput);
            const porcentaje = parseInt(nuevoPorcentajeInput);

            if (isNaN(meta) || meta < 0) {
                Alert.alert('Error', 'Ingresa un monto válido para la meta');
                return;
            }
            if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
                Alert.alert('Error', 'Ingresa un porcentaje válido (0-100)');
                return;
            }

            await authController.actualizarMetaAhorro(usuario.id, meta, porcentaje);
            setMetaAhorro(meta);
            setPorcentajeAhorro(porcentaje);
            setModalMetaVisible(false);
            Alert.alert('Éxito', 'Configuración de ahorro actualizada');
        } catch (error) {
            console.error('Error al guardar meta:', error);
            Alert.alert('Error', 'No se pudo actualizar la configuración');
        }
    };

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <TouchableOpacity onPress={cargarDatos}>
                                <Text style={styles.helpText}>↻</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('MiCuenta')}>
                                <Text style={styles.helpText}>Mi Cuenta</Text>
                            </TouchableOpacity>
                        </View>
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


                    <TouchableOpacity
                        style={styles.savingsContainer}
                        onPress={() => {
                            setNuevaMetaInput(metaAhorro.toString());
                            setNuevoPorcentajeInput(porcentajeAhorro.toString());
                            setModalMetaVisible(true);
                        }}
                    >
                        <View style={styles.savingsHeader}>
                            <Text style={styles.savingsTitle}>Meta de Ahorro</Text>
                            <Text style={styles.savingsAmount}>
                                ${savings.toFixed(0)} / ${metaAhorro > 0 ? metaAhorro.toFixed(0) : '---'}
                            </Text>
                        </View>
                        <View style={styles.savingsProgressContainer}>
                            <View
                                style={[
                                    styles.savingsProgress,
                                    {
                                        width: `${metaAhorro > 0 ? Math.min((savings / metaAhorro) * 100, 100) : 0}%`,
                                        backgroundColor: savings >= metaAhorro && metaAhorro > 0 ? '#22c55e' : '#06b6d4'
                                    }
                                ]}
                            />
                        </View>
                        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                            {metaAhorro > 0
                                ? `${((savings / metaAhorro) * 100).toFixed(1)}% de tu meta`
                                : 'Toca para establecer una meta de ahorro'}
                        </Text>
                    </TouchableOpacity>


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
            {/* Modal para Editar Meta */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalMetaVisible}
                onRequestClose={() => setModalMetaVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Configurar Ahorro</Text>

                        <Text style={styles.inputLabel}>Meta Total (Monto Objetivo)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. 5000"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={nuevaMetaInput}
                            onChangeText={setNuevaMetaInput}
                        />

                        <Text style={styles.inputLabel}>¿Cuánto de tu balance es ahorro?</Text>
                        <View style={styles.percentageButtons}>
                            <TouchableOpacity
                                style={[styles.percentageButton, nuevoPorcentajeInput === '100' && styles.percentageButtonActive]}
                                onPress={() => setNuevoPorcentajeInput('100')}
                            >
                                <Text style={[styles.percentageButtonText, nuevoPorcentajeInput === '100' && styles.percentageButtonTextActive]}>Todo (100%)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.percentageButton, nuevoPorcentajeInput !== '100' && styles.percentageButtonActive]}
                                onPress={() => setNuevoPorcentajeInput('20')}
                            >
                                <Text style={[styles.percentageButtonText, nuevoPorcentajeInput !== '100' && styles.percentageButtonTextActive]}>Personalizado</Text>
                            </TouchableOpacity>
                        </View>

                        {nuevoPorcentajeInput !== '100' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                                <TextInput
                                    style={[styles.input, { marginBottom: 0, flex: 1 }]}
                                    placeholder="%"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    value={nuevoPorcentajeInput}
                                    onChangeText={setNuevoPorcentajeInput}
                                    maxLength={3}
                                />
                                <Text style={{ color: 'white', fontSize: 18, marginLeft: 8 }}>%</Text>
                            </View>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalMetaVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={guardarMeta}
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#3a3a3a',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#4b5563',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        fontSize: 16,
    },
    inputLabel: {
        color: '#d1d5db',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    percentageButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    percentageButton: {
        flex: 1,
        backgroundColor: '#4b5563',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    percentageButtonActive: {
        backgroundColor: 'white',
        borderColor: 'white',
    },
    percentageButtonText: {
        color: '#d1d5db',
        fontWeight: '500',
    },
    percentageButtonTextActive: {
        color: '#374151',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: 'white',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
});

export default DashboardScreen;