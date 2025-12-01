import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DatabaseService from '../../database/DatabaseService';
import authController from '../../controllers/AuthController';

const PantallaMiCuenta = () => {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');

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
        if (usuario) {
            setNombre(usuario.nombreCompleto);
            setTelefono(usuario.telefono);
            setModalVisible(true);
        }
    };

    const handleGuardarPerfil = async () => {
        if (!nombre.trim() || !telefono.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            await authController.actualizarPerfil(usuario.id, nombre.trim(), telefono.trim());

            // Actualizar estado local
            setUsuario({
                ...usuario,
                nombreCompleto: nombre.trim(),
                telefono: telefono.trim()
            });

            setModalVisible(false);
            Alert.alert('Éxito', 'Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        }
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
            {/* Modal Editar Perfil */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Perfil</Text>

                        <Text style={styles.inputLabel}>Nombre Completo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre Completo"
                            placeholderTextColor="#9ca3af"
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        <Text style={styles.inputLabel}>Teléfono</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                            value={telefono}
                            onChangeText={setTelefono}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleGuardarPerfil}
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
        marginBottom: 24,
        textAlign: 'center',
    },
    inputLabel: {
        color: '#d1d5db',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#4b5563',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
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

export default PantallaMiCuenta;
