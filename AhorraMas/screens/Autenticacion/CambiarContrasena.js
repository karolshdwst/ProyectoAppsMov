import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatabaseService from '../../database/DatabaseService';

const CambiarContrasenaScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { usuarioId } = route.params || {};

    const [contrasenaActual, setContrasenaActual] = useState('');
    const [contrasenaNueva, setContrasenaNueva] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validaciones
        if (!contrasenaActual.trim() || !contrasenaNueva.trim() || !confirmarContrasena.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (contrasenaNueva.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (contrasenaNueva !== confirmarContrasena) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (contrasenaActual === contrasenaNueva) {
            Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
            return;
        }

        setLoading(true);

        try {
            // Cambiar contraseña
            const resultado = await DatabaseService.cambiarContrasena(
                usuarioId,
                contrasenaActual,
                contrasenaNueva
            );

            if (resultado.success) {
                Alert.alert(
                    'Contraseña Actualizada',
                    'Tu contraseña ha sido cambiada exitosamente',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Main')
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.screenContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.titleText}>Cambiar Contraseña</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.helpText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Subtitle */}
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitleText}>
                                Ingresa tu contraseña actual y la nueva contraseña
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={contrasenaActual}
                                    onChangeText={setContrasenaActual}
                                    placeholder="Contraseña actual"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />

                                <TextInput
                                    style={styles.input}
                                    value={contrasenaNueva}
                                    onChangeText={setContrasenaNueva}
                                    placeholder="Nueva contraseña"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />

                                <TextInput
                                    style={styles.input}
                                    value={confirmarContrasena}
                                    onChangeText={setConfirmarContrasena}
                                    placeholder="Confirmar nueva contraseña"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Info Text */}
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoText}>
                                    • La contraseña debe tener al menos 6 caracteres
                                </Text>
                                <Text style={styles.infoText}>
                                    • Debe ser diferente a tu contraseña actual
                                </Text>
                            </View>

                            {/* Submit Button */}
                            <View style={styles.submitContainer}>
                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#374151" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Cambiar Contraseña</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2a2a2a',
    },
    keyboardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    screenContainer: {
        backgroundColor: '#3a3a3a',
        borderRadius: 24,
        padding: 32,
        width: '100%',
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
    lockPlaceholder: {
        width: 96,
        height: 96,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4a4a4a',
        borderRadius: 48,
    },
    lockEmoji: {
        fontSize: 48,
    },
    subtitleContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    subtitleText: {
        color: '#9ca3af',
        fontSize: 16,
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        gap: 16,
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#6b7280',
        color: 'white',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
    },
    infoContainer: {
        backgroundColor: '#4a4a4a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoText: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 8,
    },
    submitContainer: {
        marginTop: 'auto',
    },
    submitButton: {
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CambiarContrasenaScreen;
