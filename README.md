# AhorraMas 🐷

Aplicación móvil integral para la gestión de finanzas personales, desarrollada con React Native y Expo. AhorraMas permite a los usuarios llevar un control detallado de sus ingresos y gastos, establecer presupuestos mensuales y visualizar estadísticas para mejorar su salud financiera.

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (Versión LTS recomendada)
- [Expo Go](https://expo.dev/client) en tu dispositivo móvil (Android/iOS) o un emulador configurado.

## 🚀 Instalación y Configuración

Sigue estos pasos para configurar el proyecto en tu entorno local:

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd AhorraMas
   ```

2. **Instalar dependencias**
   Es crucial instalar las dependencias exactas para evitar conflictos de versiones.
   ```bash
   npm install
   ```
   
   > **Nota:** Si encuentras errores de resolución de dependencias, intenta:
   > ```bash
   > npm install --legacy-peer-deps
   > ```

3. **Alinear versiones de Expo**
   Si tienes problemas, asegura la compatibilidad de versiones:
   ```bash
   npx expo install --fix
   ```

## 📱 Ejecutar la Aplicación

Para iniciar el servidor de desarrollo:

```bash
npm start
```

Para limpiar caché si hay errores:
```bash
npm start -- --clear
```

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **Registro y Login Seguro:** Validación de datos y almacenamiento seguro de credenciales (hash SHA-256).
- **Recuperación de Contraseña:** Sistema de contraseña temporal y flujo de cambio de contraseña obligatorio.
- **Gestión de Sesión:** Persistencia de sesión y cierre de sesión seguro.

### 💰 Gestión de Presupuestos
- **Presupuesto Mensual:** Establece un límite de gastos mensual.
- **Alertas:** Notificaciones visuales cuando te acercas o excedes tu límite (70%, 90%, 100%).
- **Edición:** Modifica tu presupuesto en cualquier momento.

### 📝 Control de Transacciones
- **Registro Detallado:** Agrega ingresos y gastos con categoría, monto, fecha y descripción.
- **Historial:** Visualiza todas tus transacciones ordenadas cronológicamente.
- **Categorización:** Clasifica tus gastos (Alimentación, Transporte, Ocio, Salud, etc.).

### 📊 Estadísticas y Análisis
- **Visualización Gráfica:** Gráficos de pastel (Pie Chart) para entender la distribución de gastos.
- **Resumen Financiero:** Totales de ingresos, gastos y balance actual.

### ⚙️ Configuración de Usuario
- **Mi Cuenta:** Gestión de perfil de usuario.
- **Cambio de Contraseña:** Actualización de credenciales desde la app.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React Native, Expo Framework.
- **Navegación:** React Navigation (Stack & Bottom Tabs).
- **Base de Datos:** Expo SQLite (Base de datos local en el dispositivo).
- **Seguridad:** Expo Crypto (Hashing de contraseñas).
- **UI/UX:** React Native Paper, Vector Icons, Gráficos con `react-native-chart-kit`.

## 📂 Estructura del Proyecto

```
AhorraMas/
├── assets/                 # Recursos estáticos (imágenes, fuentes)
├── controllers/            # Lógica de negocio y puente entre UI y DB
│   ├── AuthController.js
│   ├── PresupuestoController.js
│   └── TransaccionesController.js
├── database/               # Capa de persistencia
│   └── DatabaseService.js  # Configuración SQLite y métodos CRUD
├── models/                 # Definiciones de objetos de datos
│   ├── Usuario.js
│   ├── Transaccion.js
│   └── presupuesto.js
├── navigation/             # Configuración de rutas
│   ├── StackNavigator.js   # Flujo de autenticación
│   └── TabNavigator.js     # Navegación principal (Tabs inferiores)
├── screens/                # Vistas de la aplicación
│   ├── Autenticacion/      # Login, Registro, Recuperación
│   ├── Configuracion/      # Mi Cuenta
│   ├── Estadisticas/       # Gráficos y reportes
│   ├── Panel-Principal/    # Dashboard principal
│   ├── Presupuestos/       # Gestión de límites
│   └── Transacciones/      # Listas y formularios
└── services/               # Servicios auxiliares
    └── EmailService.js     # Simulación de envío de correos
```

## 💾 Base de Datos (SQLite)

La aplicación utiliza una base de datos local SQLite con las siguientes tablas principales:

1.  **usuarios**: Almacena credenciales (con hash), nombre, email y estados de seguridad (bloqueos, cambio de contraseña).
2.  **presupuestos**: Almacena el presupuesto mensual asignado por el usuario.
3.  **transacciones**: Registra cada movimiento financiero vinculado a un usuario.

## ⚠️ Notas para Desarrolladores

- **SafeAreaView:** Se utiliza `react-native-safe-area-context` para garantizar la correcta visualización en dispositivos con notch.
- **Manejo de Errores:** La aplicación incluye validaciones robustas en formularios y manejo de excepciones en operaciones de base de datos.

---
Desarrollado para el proyecto de Aplicaciones Móviles.
