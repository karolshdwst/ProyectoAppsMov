import { Usuario } from '../models/Usuario';
import DatabaseService from '../database/DatabaseService';

export class AuthController {
    constructor() {
        this.listeners = [];
        this.usuarioActual = null;
    }

    async initialize() {
        await DatabaseService.initialize();
        // Verificar si hay una sesión activa
        this.usuarioActual = await DatabaseService.obtenerSesion();
    }

    // REGISTRO
    async registrarUsuario(nombreCompleto, correo, contrasena, telefono) {
        try {
            // Validar datos
            Usuario.validarRegistro(nombreCompleto, correo, contrasena, telefono);

            // Registrar en la base de datos
            const usuarioCreado = await DatabaseService.registrarUsuario(
                nombreCompleto.trim(),
                correo.trim().toLowerCase(),
                contrasena,
                telefono.trim()
            );

            // Guardar sesión automáticamente después del registro
            const usuarioSafe = new Usuario(
                usuarioCreado.id,
                usuarioCreado.nombreCompleto,
                usuarioCreado.correo,
                '', // No guardamos la contraseña en el objeto de sesión
                usuarioCreado.telefono,
                usuarioCreado.balanceTotal,
                usuarioCreado.fechaRegistro
            );

            this.usuarioActual = usuarioSafe.toSafeObject();
            await DatabaseService.guardarSesion(this.usuarioActual);

            this.notifyListeners();

            return usuarioSafe.toSafeObject();
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    }

    // LOGIN
    async loginUsuario(correo, contrasena) {
        try {
            // Validar datos
            Usuario.validarLogin(correo, contrasena);

            // Intentar login
            const usuario = await DatabaseService.loginUsuario(
                correo.trim().toLowerCase(),
                contrasena
            );

            // Crear objeto seguro sin contraseña
            const usuarioSafe = new Usuario(
                usuario.id,
                usuario.nombreCompleto,
                usuario.correo,
                '', // No guardamos la contraseña
                usuario.telefono,
                usuario.balanceTotal,
                usuario.fechaRegistro
            );

            this.usuarioActual = usuarioSafe.toSafeObject();
            await DatabaseService.guardarSesion(this.usuarioActual);

            this.notifyListeners();

            return this.usuarioActual;
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            throw error;
        }
    }

    // CERRAR SESIÓN
    async cerrarSesion() {
        try {
            await DatabaseService.cerrarSesion();
            this.usuarioActual = null;
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            throw error;
        }
    }

    // OBTENER USUARIO ACTUAL
    async obtenerUsuarioActual() {
        if (!this.usuarioActual) {
            this.usuarioActual = await DatabaseService.obtenerSesion();
        }
        return this.usuarioActual;
    }

    async recargarUsuarioActual() {
        if (!this.usuarioActual) return null;
        
        try {
            const usuario = await DatabaseService.obtenerUsuarioPorId(this.usuarioActual.id);
            if (usuario) {
                const usuarioSafe = new Usuario(
                    usuario.id,
                    usuario.nombreCompleto,
                    usuario.correo,
                    '',
                    usuario.telefono,
                    usuario.balanceTotal,
                    usuario.fechaRegistro
                );
                this.usuarioActual = usuarioSafe.toSafeObject();
                await DatabaseService.guardarSesion(this.usuarioActual);
                this.notifyListeners();
            }
            return this.usuarioActual;
        } catch (error) {
            console.error("Error al recargar usuario:", error);
            throw error;
        }
    }

    // VERIFICAR SI HAY SESIÓN ACTIVA
    async haySesionActiva() {
        const sesion = await this.obtenerUsuarioActual();
        return sesion !== null;
    }

    // LISTENERS
    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback());
    }
}