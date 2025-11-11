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

const DashboardScreen = ({
    transactions = [],
    budgets = [],
    activeTab,
    onTabChange,
    onNavigate
}) => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savings = balance * 0.4;

    const renderBudgetItem = (budget, index) => {
        const percentage = (budget.spent / budget.limit) * 100;
        const isOverBudget = percentage > 100;

        return (
            <View key={index} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <Text style={[styles.budgetAmount, isOverBudget && styles.overBudgetAmount]}>
                        ${budget.spent} / ${budget.limit}
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.titleText}>Inicio</Text>
                        <TouchableOpacity>
                            <Text style={styles.helpText}>Ayuda</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Balance Card */}
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

                    {/* Savings Goal */}
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

                    {/* Income vs Expenses Comparison */}
                    <View style={styles.comparisonCard}>
                        <Text style={styles.comparisonTitle}>Comparación Mensual</Text>

                        <View style={styles.comparisonItem}>
                            <View style={styles.comparisonHeader}>
                                <Text style={styles.comparisonLabel}>Ingresos</Text>
                                <Text style={styles.comparisonAmount}>${totalIncome.toFixed(0)}</Text>
                            </View>
                            <View style={styles.comparisonBarContainer}>
                                <View style={[styles.comparisonBar, { backgroundColor: '#22c55e' }]} />
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
                    <View style={styles.budgetContainer}>
                        <Text style={styles.budgetTitle}>Estado de Presupuestos</Text>
                        <View style={styles.budgetList}>
                            {budgets.slice(0, 3).map(renderBudgetItem)}
                        </View>
                    </View>
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

export default DashboardScreen;