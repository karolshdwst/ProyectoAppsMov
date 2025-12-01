import { Transaccion } from '../models/Transaccion';
import DatabaseService from '../database/DatabaseService';

export class TransaccionController {
    constructor() {
        this.listeners = [];
    }

    // CREAR TRANSACCIÓN
    async crearTransaccion(usuarioId, monto, tipo, categoria, fecha, descripcion) {
        try {
            // Validar datos
            Transaccion.validar(monto, tipo, categoria);
            if (descripcion) {
                Transaccion.validarDescripcion(descripcion);
            }

            // Crear transacción
            const nuevaTransaccion = await DatabaseService.crearTransaccion(
                usuarioId,
                parseFloat(monto),
                tipo,
                categoria,
                fecha || new Date().toISOString(),
                descripcion?.trim() || ''
            );

            // Si hay presupuesto para esta categoría, actualizarlo
            if (tipo === 'gasto') {
                const fechaTransaccion = new Date(nuevaTransaccion.fecha);
                await DatabaseService.actualizarMontoGastadoPresupuesto(
                    usuarioId,
                    categoria,
                    fechaTransaccion.getMonth() + 1,
                    fechaTransaccion.getFullYear()
                );
            }

            this.notifyListeners();

            return new Transaccion(
                nuevaTransaccion.id,
                nuevaTransaccion.usuarioId,
                nuevaTransaccion.monto,
                nuevaTransaccion.tipo,
                nuevaTransaccion.categoria,
                nuevaTransaccion.fecha,
                nuevaTransaccion.descripcion
            );
        } catch (error) {
            console.error("Error al crear transacción:", error);
            throw error;
        }
    }

    // OBTENER TRANSACCIONES
    async obtenerTransacciones(usuarioId, filtros = {}) {
        try {
            const data = await DatabaseService.obtenerTransaccionesPorUsuario(usuarioId, filtros);
            return data.map(t => new Transaccion(
                t.id,
                t.usuarioId,
                t.monto,
                t.tipo,
                t.categoria,
                t.fecha,
                t.descripcion
            ));
        } catch (error) {
            console.error("Error al obtener transacciones:", error);
            throw new Error("No se pudieron obtener las transacciones");
        }
    }

    // OBTENER TRANSACCIONES POR TIPO
    async obtenerTransaccionesPorTipo(usuarioId, tipo) {
        try {
            return await this.obtenerTransacciones(usuarioId, { tipo });
        } catch (error) {
            console.error("Error al obtener transacciones por tipo:", error);
            throw error;
        }
    }

    // OBTENER TRANSACCIONES RECIENTES
    async obtenerTransaccionesRecientes(usuarioId, limite = 10) {
        try {
            return await this.obtenerTransacciones(usuarioId, { limite });
        } catch (error) {
            console.error("Error al obtener transacciones recientes:", error);
            throw error;
        }
    }

    // OBTENER TRANSACCIONES DEL MES
    async obtenerTransaccionesMesActual(usuarioId) {
        try {
            const ahora = new Date();
            const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
            const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59).toISOString();

            return await this.obtenerTransacciones(usuarioId, {
                fechaInicio,
                fechaFin
            });
        } catch (error) {
            console.error("Error al obtener transacciones del mes:", error);
            throw error;
        }
    }

    // BUSCAR TRANSACCIONES
    async buscarTransacciones(usuarioId, filtros) {
        try {
            const { tipo, categoria, fechaInicio, fechaFin } = filtros;

            return await this.obtenerTransacciones(usuarioId, {
                tipo,
                categoria,
                fechaInicio,
                fechaFin
            });
        } catch (error) {
            console.error("Error al buscar transacciones:", error);
            throw error;
        }
    }

    // ACTUALIZAR TRANSACCIÓN
    async actualizarTransaccion(id, monto, tipo, categoria, fecha, descripcion) {
        try {
            // Validar datos
            Transaccion.validar(monto, tipo, categoria);
            if (descripcion) {
                Transaccion.validarDescripcion(descripcion);
            }

            // Obtener transacción original
            const transaccionOriginal = await DatabaseService.obtenerTransaccionPorId(id);
            if (!transaccionOriginal) {
                throw new Error('Transacción no encontrada');
            }

            // Actualizar transacción
            const transaccionActualizada = await DatabaseService.actualizarTransaccion(
                id,
                parseFloat(monto),
                tipo,
                categoria,
                fecha,
                descripcion?.trim() || ''
            );

            // Actualizar presupuestos si es necesario
            if (tipo === 'gasto') {
                const fechaTransaccion = new Date(fecha);
                await DatabaseService.actualizarMontoGastadoPresupuesto(
                    transaccionActualizada.usuarioId,
                    categoria,
                    fechaTransaccion.getMonth() + 1,
                    fechaTransaccion.getFullYear()
                );
            }

            // Si la categoría original era diferente y era gasto, actualizar el presupuesto anterior
            if (transaccionOriginal.tipo === 'gasto' && transaccionOriginal.categoria !== categoria) {
                const fechaOriginal = new Date(transaccionOriginal.fecha);
                await DatabaseService.actualizarMontoGastadoPresupuesto(
                    transaccionOriginal.usuarioId,
                    transaccionOriginal.categoria,
                    fechaOriginal.getMonth() + 1,
                    fechaOriginal.getFullYear()
                );
            }

            this.notifyListeners();

            return new Transaccion(
                transaccionActualizada.id,
                transaccionActualizada.usuarioId,
                transaccionActualizada.monto,
                transaccionActualizada.tipo,
                transaccionActualizada.categoria,
                transaccionActualizada.fecha,
                transaccionActualizada.descripcion
            );
        } catch (error) {
            console.error("Error al actualizar transacción:", error);
            throw error;
        }
    }

    // ELIMINAR TRANSACCIÓN
    async eliminarTransaccion(id) {
        try {
            // Obtener la transacción antes de eliminarla para actualizar presupuestos
            const transaccion = await DatabaseService.obtenerTransaccionPorId(id);
            if (!transaccion) {
                throw new Error('Transacción no encontrada');
            }

            await DatabaseService.eliminarTransaccion(id);

            // Si era un gasto, actualizar el presupuesto
            if (transaccion.tipo === 'gasto') {
                const fecha = new Date(transaccion.fecha);
                await DatabaseService.actualizarMontoGastadoPresupuesto(
                    transaccion.usuarioId,
                    transaccion.categoria,
                    fecha.getMonth() + 1,
                    fecha.getFullYear()
                );
            }

            this.notifyListeners();
            return true;
        } catch (error) {
            console.error("Error al eliminar transacción:", error);
            throw error;
        }
    }

    // OBTENER ESTADÍSTICAS
    async obtenerEstadisticasMensuales(usuarioId, mes, anio) {
        try {
            const mesActual = mes || new Date().getMonth() + 1;
            const anioActual = anio || new Date().getFullYear();

            return await DatabaseService.obtenerEstadisticasMensuales(
                usuarioId,
                mesActual,
                anioActual
            );
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            throw error;
        }
    }

    async obtenerComparacionMensual(usuarioId) {
        try {
            const ahora = new Date();
            const mesActual = ahora.getMonth() + 1;
            const anioActual = ahora.getFullYear();

            // Obtener estadísticas del mes actual
            const estadisticasActuales = await this.obtenerEstadisticasMensuales(
                usuarioId,
                mesActual,
                anioActual
            );

            // Obtener estadísticas del mes anterior
            let mesAnterior = mesActual - 1;
            let anioAnterior = anioActual;
            if (mesAnterior === 0) {
                mesAnterior = 12;
                anioAnterior -= 1;
            }

            const estadisticasAnteriores = await this.obtenerEstadisticasMensuales(
                usuarioId,
                mesAnterior,
                anioAnterior
            );

            return {
                mesActual: estadisticasActuales,
                mesAnterior: estadisticasAnteriores,
                diferenciaIngresos: estadisticasActuales.totalIngresos - estadisticasAnteriores.totalIngresos,
                diferenciaGastos: estadisticasActuales.totalGastos - estadisticasAnteriores.totalGastos,
                diferenciaBalance: estadisticasActuales.balance - estadisticasAnteriores.balance
            };
        } catch (error) {
            console.error("Error al obtener comparación mensual:", error);
            throw error;
        }
    }

    // OBTENER CATEGORÍAS
    obtenerCategoriasGastos() {
        return Transaccion.CATEGORIAS_GASTOS;
    }

    obtenerCategoriasIngresos() {
        return Transaccion.CATEGORIAS_INGRESOS;
    }

    obtenerTodasCategorias() {
        return {
            gastos: Transaccion.CATEGORIAS_GASTOS,
            ingresos: Transaccion.CATEGORIAS_INGRESOS
        };
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

// Exportar como singleton
export default new TransaccionController();