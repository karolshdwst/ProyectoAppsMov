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
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const cerdo = require('../../assets/cerdo.png');

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleSubmit = () => {
        // Logic to send password reset email
        Alert.alert(
            'Correo Enviado',
            'Se ha enviado un correo para recuperar tu contraseña',
            [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]
        );
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
                            <Text style={styles.titleText}>Recuperar Contraseña</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.helpText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.piggyBankPlaceholder}>
                                <Image source={cerdo} style={styles.piggyBankImage} />
                            </View>
                        </View>

                        {/* Subtitle */}
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitleText}>
                                Ingresa tu email para recuperar tu contraseña
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="email@dominio.com"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Submit Button */}
                            <View style={styles.submitContainer}>
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.submitButtonText}>Enviar Correo</Text>
                                </TouchableOpacity>

                                <View style={styles.registerContainer}>
                                    <Text style={styles.registerText}>¿Recuerdas tu contraseña? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.registerLink}>Inicia Sesión</Text>
                                    </TouchableOpacity>
                                </View>
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
        maxWidth: 400,
        minHeight: 700,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 48,
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
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    piggyBankPlaceholder: {
        width: 96,
        height: 96,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4a4a4a',
        borderRadius: 48,
    },
    piggyBankImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        overflow: 'hidden',
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
    submitButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    registerLink: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;
