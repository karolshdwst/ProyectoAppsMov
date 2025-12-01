import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DatabaseService from '../../database/DatabaseService';

const PantallaMiCuenta = () => {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        cargarDatosUsuario();
    }, []);

    const cargarDatosUsuario = async () => {
        try {
            const sesion = await DatabaseService.obtenerSesion();
            if (sesion) {
                setUsuario(sesion);
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
        }
    };

    const handleCerrarSesion = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await DatabaseService.cerrarSesion();
                        navigation.replace('Login');
                    },
                },
            ]
        );
    };

    const handleCambiarContrasena = () => {
        if (usuario) {
            navigation.navigate('CambiarPassword', { usuarioId: usuario.id });
        }
    };

    const handleEditarPerfil = () => {
        Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto');
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
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.backText}>← Atrás</Text>
                        </TouchableOpacity>
                        <Text style={styles.titleText}>Mi Cuenta</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    {/* Información del Usuario */}
                    {usuario && (
                        <View style={styles.userInfoCard}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {usuario.nombreCompleto.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.userName}>{usuario.nombreCompleto}</Text>
                            <Text style={styles.userEmail}>{usuario.correo}</Text>
                            <Text style={styles.userPhone}>{usuario.telefono}</Text>
                        </View>
                    )}

                    {/* Opciones de Cuenta */}
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={handleEditarPerfil}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>Editar Perfil</Text>
                                    <Text style={styles.optionSubtitle}>
                                        Cambia tu nombre, teléfono y otros datos
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.optionArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={handleCambiarContrasena}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>Cambiar Contraseña</Text>
                                    <Text style={styles.optionSubtitle}>
                                        Actualiza tu contraseña de acceso
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.optionArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, styles.logoutButton]}
                            onPress={handleCerrarSesion}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.optionTextContainer}>
                                    <Text style={[styles.optionTitle, styles.logoutText]}>
                                        Cerrar Sesión
                                    </Text>
                                    <Text style={styles.optionSubtitle}>
                                        Sal de tu cuenta de forma segura
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.optionArrow}>›</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Información Adicional */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>Versión 1.0.0</Text>
                        <Text style={styles.infoText}>© 2025 AhorraMas</Text>
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
        height: 700,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    backText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    titleText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    userInfoCard: {
        backgroundColor: '#6b7280',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4a4a4a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '600',
    },
    userName: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    userEmail: {
        color: '#d1d5db',
        fontSize: 14,
        marginBottom: 4,
    },
    userPhone: {
        color: '#9ca3af',
        fontSize: 14,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    optionButton: {
        backgroundColor: '#6b7280',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    optionSubtitle: {
        color: '#9ca3af',
        fontSize: 12,
    },
    optionArrow: {
        color: '#9ca3af',
        fontSize: 24,
        marginLeft: 8,
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    logoutText: {
        color: '#fca5a5',
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    infoText: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 4,
    },
});

export default PantallaMiCuenta;
