import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const LoginScreen = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (email && password) {
      onLogin();
    } else {
      Alert.alert(
        'Error',
        'Por favor completa todos los campos',
        [{ text: 'OK' }]
      );
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
              <Text style={styles.titleText}>Iniciar Sesión</Text>
              <TouchableOpacity>
                <Text style={styles.helpText}>Ayuda</Text>
              </TouchableOpacity>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.piggyBankPlaceholder}>
                <Text style={styles.piggyBankEmoji}>🐷</Text>
              </View>
            </View>

            {/* Subtitle */}
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>
                Ingresa tus credenciales para acceder
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
                
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Forgot Password */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <View style={styles.submitContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Iniciar Sesión</Text>
                </TouchableOpacity>
                
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                  <TouchableOpacity onPress={() => onNavigate('register')}>
                    <Text style={styles.registerLink}>Regístrate</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  Al hacer click aceptas{' '}
                  <Text style={styles.termsLink}>Términos de servicio</Text> y{' '}
                  <Text style={styles.termsLink}>Política de privacidad</Text>
                </Text>
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
  piggyBankEmoji: {
    fontSize: 40,
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
  forgotPasswordContainer: {
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#9ca3af',
    fontSize: 14,
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
  termsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  termsText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#9ca3af',
  },
});

export default LoginScreen;