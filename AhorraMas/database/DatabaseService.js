import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

class DatabaseService {
    constructor() {
        this.db = null;
        this.storageKeys = {
            usuarios: 'app_usuarios',
            transacciones: 'app_transacciones',
            presupuestos: 'app_presupuestos',
            sesion: 'app_sesion_activa'
        };
    }

    // INICIALIZACIÓN
    
    async initialize() {
        if (Platform.OS === 'web') {
            console.log('Usando LocalStorage para web');
            this.initializeWebStorage();
        } else {
            console.log('Usando SQLite para móvil');
            await this.initializeSQLite();
        }
    }

    initializeWebStorage() {
        // Inicializar arrays vacíos si no existen
        if (!localStorage.getItem(this.storageKeys.usuarios)) {
            localStorage.setItem(this.storageKeys.usuarios, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.transacciones)) {
            localStorage.setItem(this.storageKeys.transacciones, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.presupuestos)) {
            localStorage.setItem(this.storageKeys.presupuestos, JSON.stringify([]));
        }
    }

    async initializeSQLite() {
        this.db = await SQLite.openDatabaseAsync('ahorros_app.db');

        // Crear tabla de usuarios
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombreCompleto TEXT NOT NULL,
                correo TEXT UNIQUE NOT NULL,
                contrasena TEXT NOT NULL,
                telefono TEXT NOT NULL,
                balanceTotal REAL DEFAULT 0,
                fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Crear tabla de transacciones
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS transacciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuarioId INTEGER NOT NULL,
                monto REAL NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
                categoria TEXT NOT NULL,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                descripcion TEXT,
                FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE
            );
        `);

        // Crear tabla de presupuestos
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS presupuestos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuarioId INTEGER NOT NULL,
                categoria TEXT NOT NULL,
                montoLimite REAL NOT NULL,
                montoGastado REAL DEFAULT 0,
                mes INTEGER NOT NULL,
                anio INTEGER NOT NULL,
                fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE(usuarioId, categoria, mes, anio)
            );
        `);

        // Crear índices para mejorar rendimiento
        await this.db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones(usuarioId);
            CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);
            CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo);
            CREATE INDEX IF NOT EXISTS idx_presupuestos_usuario ON presupuestos(usuarioId);
        `);

        console.log('Base de datos SQLite inicializada correctamente');
    }

    // =====================================================
    // FUNCIONES DE HASH PARA CONTRASEÑAS
    // =====================================================
    async hashPassword(password) {
        if (Platform.OS === 'web') {
            // En web, usamos un hash simple (en producción usa bcrypt o similar)
            return btoa(password); // Base64 encode
        } else {
            // En móvil, usamos Expo Crypto
            const digest = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                password
            );
            return digest;
        }
    }

    async verifyPassword(password, hashedPassword) {
        const hash = await this.hashPassword(password);
        return hash === hashedPassword;
    }

    
    // GESTIÓN DE SESIÓN
 
    async guardarSesion(usuario) {
        if (Platform.OS === 'web') {
            localStorage.setItem(this.storageKeys.sesion, JSON.stringify(usuario));
        } else {
            // En móvil podrías usar AsyncStorage o SecureStore
            // Por ahora usamos una variable en memoria
            this.sesionActiva = usuario;
        }
    }

    async obtenerSesion() {
        if (Platform.OS === 'web') {
            const sesion = localStorage.getItem(this.storageKeys.sesion);
            return sesion ? JSON.parse(sesion) : null;
        } else {
            return this.sesionActiva || null;
        }
    }

    async cerrarSesion() {
        if (Platform.OS === 'web') {
            localStorage.removeItem(this.storageKeys.sesion);
        } else {
            this.sesionActiva = null;
        }
    }

    
    // CRUD USUARIOS
    
    async registrarUsuario(nombreCompleto, correo, contrasena, telefono) {
        const contrasenaHash = await this.hashPassword(contrasena);

        if (Platform.OS === 'web') {
            const usuarios = JSON.parse(localStorage.getItem(this.storageKeys.usuarios));

            // Verificar si el correo ya existe
            if (usuarios.find(u => u.correo === correo)) {
                throw new Error('Este correo ya está registrado');
            }

            const nuevoUsuario = {
                id: Date.now(),
                nombreCompleto,
                correo,
                contrasena: contrasenaHash,
                telefono,
                balanceTotal: 0,
                fechaRegistro: new Date().toISOString()
            };

            usuarios.push(nuevoUsuario);
            localStorage.setItem(this.storageKeys.usuarios, JSON.stringify(usuarios));
            return nuevoUsuario;
        } else {
            try {
                const result = await this.db.runAsync(
                    'INSERT INTO usuarios (nombreCompleto, correo, contrasena, telefono) VALUES (?, ?, ?, ?);',
                    nombreCompleto, correo, contrasenaHash, telefono
                );

                return {
                    id: result.lastInsertRowId,
                    nombreCompleto,
                    correo,
                    contrasena: contrasenaHash,
                    telefono,
                    balanceTotal: 0,
                    fechaRegistro: new Date().toISOString()
                };
            } catch (error) {
                if (error.message.includes('UNIQUE constraint failed')) {
                    throw new Error('Este correo ya está registrado');
                }
                throw error;
            }
        }
    }

    async loginUsuario(correo, contrasena) {
        if (Platform.OS === 'web') {
            const usuarios = JSON.parse(localStorage.getItem(this.storageKeys.usuarios));
            const usuario = usuarios.find(u => u.correo === correo);

            if (!usuario) {
                throw new Error('Correo o contraseña incorrectos');
            }

            const passwordValida = await this.verifyPassword(contrasena, usuario.contrasena);
            if (!passwordValida) {
                throw new Error('Correo o contraseña incorrectos');
            }

            return usuario;
        } else {
            const usuario = await this.db.getFirstAsync(
                'SELECT * FROM usuarios WHERE correo = ?;',
                correo
            );

            if (!usuario) {
                throw new Error('Correo o contraseña incorrectos');
            }

            const passwordValida = await this.verifyPassword(contrasena, usuario.contrasena);
            if (!passwordValida) {
                throw new Error('Correo o contraseña incorrectos');
            }

            return usuario;
        }
    }

    async obtenerUsuarioPorId(id) {
        if (Platform.OS === 'web') {
            const usuarios = JSON.parse(localStorage.getItem(this.storageKeys.usuarios));
            return usuarios.find(u => u.id === id);
        } else {
            return await this.db.getFirstAsync('SELECT * FROM usuarios WHERE id = ?;', id);
        }
    }

    async actualizarBalanceUsuario(usuarioId, nuevoBalance) {
        if (Platform.OS === 'web') {
            const usuarios = JSON.parse(localStorage.getItem(this.storageKeys.usuarios));
            const index = usuarios.findIndex(u => u.id === usuarioId);

            if (index === -1) throw new Error('Usuario no encontrado');

            usuarios[index].balanceTotal = nuevoBalance;
            localStorage.setItem(this.storageKeys.usuarios, JSON.stringify(usuarios));
            return usuarios[index];
        } else {
            await this.db.runAsync(
                'UPDATE usuarios SET balanceTotal = ? WHERE id = ?;',
                nuevoBalance, usuarioId
            );
            return await this.obtenerUsuarioPorId(usuarioId);
        }
    }

    
    // CRUD TRANSACCIONES
    
    async crearTransaccion(usuarioId, monto, tipo, categoria, fecha, descripcion) {
        if (Platform.OS === 'web') {
            const transacciones = JSON.parse(localStorage.getItem(this.storageKeys.transacciones));

            const nuevaTransaccion = {
                id: Date.now(),
                usuarioId,
                monto: parseFloat(monto),
                tipo,
                categoria,
                fecha: fecha || new Date().toISOString(),
                descripcion: descripcion || ''
            };

            transacciones.unshift(nuevaTransaccion);
            localStorage.setItem(this.storageKeys.transacciones, JSON.stringify(transacciones));

            // Actualizar balance del usuario
            await this.actualizarBalanceDespuesDeTransaccion(usuarioId, monto, tipo);

            return nuevaTransaccion;
        } else {
            const result = await this.db.runAsync(
                'INSERT INTO transacciones (usuarioId, monto, tipo, categoria, fecha, descripcion) VALUES (?, ?, ?, ?, ?, ?);',
                usuarioId, parseFloat(monto), tipo, categoria, fecha || new Date().toISOString(), descripcion || ''
            );

            // Actualizar balance del usuario
            await this.actualizarBalanceDespuesDeTransaccion(usuarioId, monto, tipo);

            return {
                id: result.lastInsertRowId,
                usuarioId,
                monto: parseFloat(monto),
                tipo,
                categoria,
                fecha: fecha || new Date().toISOString(),
                descripcion: descripcion || ''
            };
        }
    }

    async obtenerTransaccionesPorUsuario(usuarioId, filtros = {}) {
        const { tipo, categoria, fechaInicio, fechaFin, limite } = filtros;

        if (Platform.OS === 'web') {
            let transacciones = JSON.parse(localStorage.getItem(this.storageKeys.transacciones));

            // Filtrar por usuario
            transacciones = transacciones.filter(t => t.usuarioId === usuarioId);

            // Aplicar filtros
            if (tipo) {
                transacciones = transacciones.filter(t => t.tipo === tipo);
            }
            if (categoria) {
                transacciones = transacciones.filter(t => t.categoria === categoria);
            }
            if (fechaInicio) {
                transacciones = transacciones.filter(t => new Date(t.fecha) >= new Date(fechaInicio));
            }
            if (fechaFin) {
                transacciones = transacciones.filter(t => new Date(t.fecha) <= new Date(fechaFin));
            }

            // Ordenar por fecha descendente
            transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // Limitar resultados
            if (limite) {
                transacciones = transacciones.slice(0, limite);
            }

            return transacciones;
        } else {
            let query = 'SELECT * FROM transacciones WHERE usuarioId = ?';
            const params = [usuarioId];

            if (tipo) {
                query += ' AND tipo = ?';
                params.push(tipo);
            }
            if (categoria) {
                query += ' AND categoria = ?';
                params.push(categoria);
            }
            if (fechaInicio) {
                query += ' AND fecha >= ?';
                params.push(fechaInicio);
            }
            if (fechaFin) {
                query += ' AND fecha <= ?';
                params.push(fechaFin);
            }

            query += ' ORDER BY fecha DESC';

            if (limite) {
                query += ' LIMIT ?';
                params.push(limite);
            }

            return await this.db.getAllAsync(query, ...params);
        }
    }

    async actualizarTransaccion(id, monto, tipo, categoria, fecha, descripcion) {
        // Primero obtener la transacción original para ajustar el balance
        const transaccionOriginal = await this.obtenerTransaccionPorId(id);
        if (!transaccionOriginal) throw new Error('Transacción no encontrada');

        if (Platform.OS === 'web') {
            const transacciones = JSON.parse(localStorage.getItem(this.storageKeys.transacciones));
            const index = transacciones.findIndex(t => t.id === id);

            if (index === -1) throw new Error('Transacción no encontrada');

            transacciones[index] = {
                ...transacciones[index],
                monto: parseFloat(monto),
                tipo,
                categoria,
                fecha,
                descripcion
            };

            localStorage.setItem(this.storageKeys.transacciones, JSON.stringify(transacciones));

            // Revertir balance original y aplicar nuevo
            await this.revertirBalanceTransaccion(transaccionOriginal.usuarioId, transaccionOriginal.monto, transaccionOriginal.tipo);
            await this.actualizarBalanceDespuesDeTransaccion(transaccionOriginal.usuarioId, monto, tipo);

            return transacciones[index];
        } else {
            await this.db.runAsync(
                'UPDATE transacciones SET monto = ?, tipo = ?, categoria = ?, fecha = ?, descripcion = ? WHERE id = ?;',
                parseFloat(monto), tipo, categoria, fecha, descripcion, id
            );

            // Revertir balance original y aplicar nuevo
            await this.revertirBalanceTransaccion(transaccionOriginal.usuarioId, transaccionOriginal.monto, transaccionOriginal.tipo);
            await this.actualizarBalanceDespuesDeTransaccion(transaccionOriginal.usuarioId, monto, tipo);

            return await this.obtenerTransaccionPorId(id);
        }
    }

    async eliminarTransaccion(id) {
        // Obtener la transacción para revertir el balance
        const transaccion = await this.obtenerTransaccionPorId(id);
        if (!transaccion) throw new Error('Transacción no encontrada');

        if (Platform.OS === 'web') {
            const transacciones = JSON.parse(localStorage.getItem(this.storageKeys.transacciones));
            const filtered = transacciones.filter(t => t.id !== id);

            if (transacciones.length === filtered.length) {
                throw new Error('Transacción no encontrada');
            }

            localStorage.setItem(this.storageKeys.transacciones, JSON.stringify(filtered));

            // Revertir balance
            await this.revertirBalanceTransaccion(transaccion.usuarioId, transaccion.monto, transaccion.tipo);

            return true;
        } else {
            await this.db.runAsync('DELETE FROM transacciones WHERE id = ?;', id);

            // Revertir balance
            await this.revertirBalanceTransaccion(transaccion.usuarioId, transaccion.monto, transaccion.tipo);

            return true;
        }
    }

    async obtenerTransaccionPorId(id) {
        if (Platform.OS === 'web') {
            const transacciones = JSON.parse(localStorage.getItem(this.storageKeys.transacciones));
            return transacciones.find(t => t.id === id);
        } else {
            return await this.db.getFirstAsync('SELECT * FROM transacciones WHERE id = ?;', id);
        }
    }

    
    // FUNCIONES AUXILIARES DE BALANCE
    
    async actualizarBalanceDespuesDeTransaccion(usuarioId, monto, tipo) {
        const usuario = await this.obtenerUsuarioPorId(usuarioId);
        if (!usuario) return;

        let nuevoBalance = usuario.balanceTotal;
        if (tipo === 'ingreso') {
            nuevoBalance += parseFloat(monto);
        } else if (tipo === 'gasto') {
            nuevoBalance -= parseFloat(monto);
        }

        await this.actualizarBalanceUsuario(usuarioId, nuevoBalance);
    }

    async revertirBalanceTransaccion(usuarioId, monto, tipo) {
        const usuario = await this.obtenerUsuarioPorId(usuarioId);
        if (!usuario) return;

        let nuevoBalance = usuario.balanceTotal;
        // Revertir: si era ingreso, restar; si era gasto, sumar
        if (tipo === 'ingreso') {
            nuevoBalance -= parseFloat(monto);
        } else if (tipo === 'gasto') {
            nuevoBalance += parseFloat(monto);
        }

        await this.actualizarBalanceUsuario(usuarioId, nuevoBalance);
    }

   
    // ESTADÍSTICAS Y REPORTES
   
    async obtenerEstadisticasMensuales(usuarioId, mes, anio) {
        const fechaInicio = new Date(anio, mes - 1, 1).toISOString();
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59).toISOString();

        const transacciones = await this.obtenerTransaccionesPorUsuario(usuarioId, {
            fechaInicio,
            fechaFin
        });

        const ingresos = transacciones
            .filter(t => t.tipo === 'ingreso')
            .reduce((sum, t) => sum + t.monto, 0);

        const gastos = transacciones
            .filter(t => t.tipo === 'gasto')
            .reduce((sum, t) => sum + t.monto, 0);

        // Gastos por categoría
        const gastosPorCategoria = {};
        transacciones
            .filter(t => t.tipo === 'gasto')
            .forEach(t => {
                if (!gastosPorCategoria[t.categoria]) {
                    gastosPorCategoria[t.categoria] = 0;
                }
                gastosPorCategoria[t.categoria] += t.monto;
            });

        return {
            mes,
            anio,
            totalIngresos: ingresos,
            totalGastos: gastos,
            balance: ingresos - gastos,
            gastosPorCategoria,
            cantidadTransacciones: transacciones.length
        };
    }

    
    // CRUD PRESUPUESTOS
   
    async crearPresupuesto(usuarioId, categoria, montoLimite, mes, anio) {
        const mesActual = mes || new Date().getMonth() + 1;
        const anioActual = anio || new Date().getFullYear();

        if (Platform.OS === 'web') {
            const presupuestos = JSON.parse(localStorage.getItem(this.storageKeys.presupuestos));

            // Verificar si ya existe un presupuesto para esa categoría en ese mes
            const existe = presupuestos.find(p =>
                p.usuarioId === usuarioId &&
                p.categoria === categoria &&
                p.mes === mesActual &&
                p.anio === anioActual
            );

            if (existe) {
                throw new Error('Ya existe un presupuesto para esta categoría en este mes');
            }

            const nuevoPresupuesto = {
                id: Date.now(),
                usuarioId,
                categoria,
                montoLimite: parseFloat(montoLimite),
                montoGastado: 0,
                mes: mesActual,
                anio: anioActual,
                fechaCreacion: new Date().toISOString()
            };

            presupuestos.push(nuevoPresupuesto);
            localStorage.setItem(this.storageKeys.presupuestos, JSON.stringify(presupuestos));
            return nuevoPresupuesto;
        } else {
            try {
                const result = await this.db.runAsync(
                    'INSERT INTO presupuestos (usuarioId, categoria, montoLimite, mes, anio) VALUES (?, ?, ?, ?, ?);',
                    usuarioId, categoria, parseFloat(montoLimite), mesActual, anioActual
                );

                return {
                    id: result.lastInsertRowId,
                    usuarioId,
                    categoria,
                    montoLimite: parseFloat(montoLimite),
                    montoGastado: 0,
                    mes: mesActual,
                    anio: anioActual,
                    fechaCreacion: new Date().toISOString()
                };
            } catch (error) {
                if (error.message.includes('UNIQUE constraint failed')) {
                    throw new Error('Ya existe un presupuesto para esta categoría en este mes');
                }
                throw error;
            }
        }
    }
    async obtenerPresupuestosPorUsuario(usuarioId, mes, anio) {
        const mesActual = mes || new Date().getMonth() + 1;
        const anioActual = anio || new Date().getFullYear();

        if (Platform.OS === 'web') {
            const presupuestos = JSON.parse(localStorage.getItem(this.storageKeys.presupuestos));
            return presupuestos.filter(p =>
                p.usuarioId === usuarioId &&
                p.mes === mesActual &&
                p.anio === anioActual
            );
        } else {
            return await this.db.getAllAsync(
                'SELECT * FROM presupuestos WHERE usuarioId = ? AND mes = ? AND anio = ?;',
                usuarioId, mesActual, anioActual
            );
        }
    }

    async actualizarPresupuesto(id, categoria, montoLimite) {
        if (Platform.OS === 'web') {
            const presupuestos = JSON.parse(localStorage.getItem(this.storageKeys.presupuestos));
            const index = presupuestos.findIndex(p => p.id === id);

            if (index === -1) throw new Error('Presupuesto no encontrado');

            presupuestos[index].categoria = categoria;
            presupuestos[index].montoLimite = parseFloat(montoLimite);

            localStorage.setItem(this.storageKeys.presupuestos, JSON.stringify(presupuestos));
            return presupuestos[index];
        } else {
            await this.db.runAsync(
                'UPDATE presupuestos SET categoria = ?, montoLimite = ? WHERE id = ?;',
                categoria, parseFloat(montoLimite), id
            );
            return await this.obtenerPresupuestoPorId(id);
        }
    }

    async eliminarPresupuesto(id) {
        if (Platform.OS === 'web') {
            const presupuestos = JSON.parse(localStorage.getItem(this.storageKeys.presupuestos));
            const filtered = presupuestos.filter(p => p.id !== id);

            if (presupuestos.length === filtered.length) {
                throw new Error('Presupuesto no encontrado');
            }

            localStorage.setItem(this.storageKeys.presupuestos, JSON.stringify(filtered));
            return true;
        } else {
            await this.db.runAsync('DELETE FROM presupuestos WHERE id = ?;', id);
            return true;
        }
    }

    async obtenerPresupuestoPorId(id) {
        if (Platform.OS === 'web') {
            const presupuestos = JSON.parse(localStorage.getItem(this.storageKeys.presupuestos));
            return presupuestos.find(p => p.id === id);
        } else {
            return await this.db.getFirstAsync('SELECT * FROM presupuestos WHERE id = ?;', id);
        }
    }

    async actualizarMontoGastadoPresupuesto(usuarioId, categoria, mes, anio) {
        // Obtener el presupuesto
        const presupuestos = await this.obtenerPresupuestosPorUsuario(usuarioId, mes, anio);
        const presupuesto = presupuestos.find(p => p.categoria === categoria);

        if (!presupuesto) return;

        // Calcular el monto gastado en esa categoría en ese mes
        const fechaInicio = new Date(anio, mes - 1, 1).toISOString();
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59).toISOString();

        const transacciones = await this.obtenerTransaccionesPorUsuario(usuarioId, {
            tipo: 'gasto',
            categoria,
            fechaInicio,
            fechaFin
        });

        const montoGastado = transacciones.reduce((sum, t) => sum + t.monto, 0);

        // Actualizar el presupuesto
        if (Platform.OS === 'web') {
            const presupuestos = JSON.parse(localStorage.getItem(this.storageKeys.presupuestos));
            const index = presupuestos.findIndex(p => p.id === presupuesto.id);

            if (index !== -1) {
                presupuestos[index].montoGastado = montoGastado;
                localStorage.setItem(this.storageKeys.presupuestos, JSON.stringify(presupuestos));
            }
        } else {
            await this.db.runAsync(
                'UPDATE presupuestos SET montoGastado = ? WHERE id = ?;',
                montoGastado, presupuesto.id
            );
        }
    }
}
export default new DatabaseService();