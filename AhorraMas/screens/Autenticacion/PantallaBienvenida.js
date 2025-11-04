import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const cerdo = require('../../assets/cerdo.png');

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ onNavigate }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenido</Text>
          <TouchableOpacity>
            <Text style={styles.helpText}>Ayuda</Text>
          </TouchableOpacity>
        </View>

        {/* Logo and Illustration */}
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Ahorra+</Text>
          </View>
          
          {/* Piggy Bank Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.piggyBankPlaceholder}>
              <Image source={cerdo} style={styles.piggyBankImage} />
            </View>
          </View>

          {/* Info Bubbles */}
          <View style={styles.infoBubblesContainer}>
            <View style={styles.infoBubble}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>📈</Text>
              </View>
              <Text style={styles.infoBubbleText}>
                Empieza a trazar tu camino hacia ese viaje
              </Text>
            </View>
            
            <View style={styles.infoBubble}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>📊</Text>
              </View>
              <Text style={styles.infoBubbleText}>
                Una idea clara tranquilidad en tanto ahorras
              </Text>
            </View>
            
            <View style={styles.infoBubble}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>🏠</Text>
              </View>
              <Text style={styles.infoBubbleText}>
                Con toda la información organizada
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate('register')}
          >
            <Text style={styles.primaryButtonText}>Register</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate('login')}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
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
    minHeight: 700,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  illustrationContainer: {
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piggyBankPlaceholder: {
    width: 192,
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a4a4a',
    borderRadius: 96,
  },
  piggyBankEmoji: {
    fontSize: 80,
  },
  infoBubblesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  infoBubble: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 100,
    marginHorizontal: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#6b7280',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: 24,
  },
  infoBubbleText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  piggyBankImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    overflow: 'hidden',
  },
});

export default WelcomeScreen;