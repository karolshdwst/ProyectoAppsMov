# AhorraMas 🐷

Aplicación móvil para gestión de finanzas personales, desarrollada con React Native y Expo.

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (Versión LTS recomendada)
- [Expo Go](https://expo.dev/client) en tu dispositivo móvil (Android/iOS) o un emulador configurado.

## 🚀 Instalación y Configuración

Sigue estos pasos para configurar el proyecto en tu entorno local tal como lo dejamos funcionando:

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd AhorraMas
   ```

2. **Instalar dependencias**
   Es crucial instalar las dependencias exactas para evitar conflictos de versiones entre React Native y sus librerías.
   ```bash
   npm install
   ```
   
   > **Nota:** Si encuentras errores de resolución de dependencias (ERESOLVE), intenta forzar la instalación o usar legacy-peer-deps, aunque el `package.json` ya debería estar corregido:
   > ```bash
   > npm install --legacy-peer-deps
   > ```

3. **Alinear versiones de Expo (Importante)**
   Si después de instalar tienes problemas, ejecuta este comando para asegurar que las versiones de las librerías (como `react-native-screens`) coincidan con lo que espera Expo:
   ```bash
   npx expo install --fix
   ```

## 📱 Ejecutar la Aplicación

Para iniciar el servidor de desarrollo:

```bash
npm start
```

Si tienes problemas de caché o errores extraños al iniciar, usa:
```bash
npm start -- --clear
```

Luego, escanea el código QR con la aplicación **Expo Go** en tu teléfono.

## ⚠️ Notas Importantes para el Desarrollo

### Sobre el error `java.lang.String cannot be cast to java.lang.Boolean`
Este proyecto ya tiene las correcciones para evitar este error común en versiones recientes.
1. **SafeAreaView:** Siempre importa `SafeAreaView` desde `react-native-safe-area-context`, **NO** desde `react-native`.
   ```javascript
   // ✅ Correcto
   import { SafeAreaView } from 'react-native-safe-area-context';
   
   // ❌ Incorrecto (causará errores de layout en algunos dispositivos)
   import { SafeAreaView } from 'react-native';
   ```
2. **Nueva Arquitectura:** Se ha deshabilitado temporalmente la "New Architecture" en `app.json` para mejorar la compatibilidad con ciertas librerías.

## 📂 Estructura del Proyecto

- **/screens**: Contiene todas las pantallas de la aplicación organizadas por módulos (Autenticación, Transacciones, etc.).
- **/navigation**: Configuración de la navegación (Stack y Tabs).
- **/assets**: Imágenes y recursos estáticos.

## 🤝 Flujo de Trabajo

1. Haz un `git pull` antes de empezar para tener las últimas correcciones.
2. Si agregas nuevas librerías, asegúrate de que sean compatibles con la versión de Expo actual.
