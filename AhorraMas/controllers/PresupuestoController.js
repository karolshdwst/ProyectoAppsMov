import { Presupuesto } from '../models/presupuesto';
import DatabaseService from '../database/DatabaseService';

export class PresupuestoController {
    constructor() {
        this.listeners = [];
    }

    async initialize() {
        await DatabaseService.initialize();
    }

    // CREAR PRESUPUESTO
    async crearPresupuesto(usuarioId, categoria, montoLimite, mes, anio) {
        try {
            // Validar datos
            Presupuesto.validar(categoria, montoLimite);

            const mesActual = mes || new Date().getMonth() + 1;
            const anioActual = anio || new Date().getFullYear();

            // Crear presupuesto
            const nuevoPresupuesto = await DatabaseService.crearPresupuesto(
                usuarioId,
                categoria.trim(),
                parseFloat(montoLimite),
                mesActual,
                anioActual
            );

            // Calcular el monto gastado actual
            await DatabaseService.actualizarMontoGastadoPresupuesto(
                usuarioId,
                categoria,
                mesActual,
                anioActual
            );

            this.notifyListeners();

            return new Presupuesto(
                nuevoPresupuesto.id,
                nuevoPresupuesto.usuarioId,
                nuevoPresupuesto.categoria,
                nuevoPresupuesto.montoLimite,
                nuevoPresupuesto.montoGastado,
                nuevoPresupuesto.mes,
                nuevoPresupuesto.anio,
                nuevoPresupuesto.fechaCreacion
            );
        } catch (error) {
            console.error("Error al crear presupuesto:", error);
            throw error;
        }
    }

    // OBTENER PRESUPUESTOS
    async obtenerPresupuestos(usuarioId, mes, anio) {
        try {
            const mesActual = mes || new Date().getMonth() + 1;
            const anioActual = anio || new Date().getFullYear();

            const data = await DatabaseService.obtenerPresupuestosPorUsuario(
                usuarioId,
                mesActual,
                anioActual
            );

            return data.map(p => new Presupuesto(
                p.id,
                p.usuarioId,
                p.categoria,
                p.montoLimite,
                p.montoGastado,
                p.mes,
                p.anio,
                p.fechaCreacion
            ));
        } catch (error) {
            console.error("Error al obtener presupuestos:", error);
            throw new Error("No se pudieron obtener los presupuestos");
        }
    }

    async actualizarTodosLosPresupuestos(usuarioId) {
        const presupuestos = await this.obtenerPresupuestos(usuarioId);

        for (const p of presupuestos) {
            // obtener transacciones gastadas del mismo mes, año y categoría
            const transacciones = await this.obtenerTransaccionesPorCategoriaYMes(
                usuarioId,
                p.categoria,
                p.mes,
                p.anio
            );

            const montoGastado = transacciones
                .filter(t => t.tipo === "gasto")
                .reduce((acc, t) => acc + Number(t.monto), 0);

            // actualizar el presupuesto
            await this.actualizarMontoGastado(p.id, montoGastado);
        }
    }

    async obtenerTransaccionesPorCategoriaYMes(usuarioId, categoria, mes, anio) {
        return await this.db.getAllAsync(
            `SELECT * FROM transacciones 
         WHERE usuarioId = ? 
           AND categoria = ?
           AND strftime('%m', fecha) = ?
           AND strftime('%Y', fecha) = ?`,
            usuarioId,
            categoria,
            String(mes).padStart(2, "0"),
            String(anio)
        );
    }

    async actualizarMontoGastado(idPresupuesto, monto) {
        await this.db.runAsync(
            `UPDATE presupuestos SET montoGastado = ? WHERE id = ?`,
            monto,
            idPresupuesto
        );
    }

    // OBTENER PRESUPUESTOS DEL MES ACTUAL
    async obtenerPresupuestosMesActual(usuarioId) {
        try {
            const ahora = new Date();
            return await this.obtenerPresupuestos(
                usuarioId,
                ahora.getMonth() + 1,
                ahora.getFullYear()
            );
        } catch (error) {
            console.error("Error al obtener presupuestos del mes actual:", error);
            throw error;
        }
    }

    // ACTUALIZAR PRESUPUESTO
    async actualizarPresupuesto(id, categoria, montoLimite) {
        try {
            // Validar datos
            Presupuesto.validar(categoria, montoLimite);

            const presupuestoActualizado = await DatabaseService.actualizarPresupuesto(
                id,
                categoria.trim(),
                parseFloat(montoLimite)
            );

            this.notifyListeners();

            return new Presupuesto(
                presupuestoActualizado.id,
                presupuestoActualizado.usuarioId,
                presupuestoActualizado.categoria,
                presupuestoActualizado.montoLimite,
                presupuestoActualizado.montoGastado,
                presupuestoActualizado.mes,
                presupuestoActualizado.anio,
                presupuestoActualizado.fechaCreacion
            );
        } catch (error) {
            console.error("Error al actualizar presupuesto:", error);
            throw error;
        }
    }

    // ELIMINAR PRESUPUESTO
    async eliminarPresupuesto(id) {
        try {
            await DatabaseService.eliminarPresupuesto(id);
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error("Error al eliminar presupuesto:", error);
            throw error;
        }
    }

    // ACTUALIZAR MONTOS GASTADOS
    async actualizarTodosLosPresupuestos(usuarioId) {
        try {
            const ahora = new Date();
            const mes = ahora.getMonth() + 1;
            const anio = ahora.getFullYear();

            const presupuestos = await this.obtenerPresupuestos(usuarioId, mes, anio);

            for (const presupuesto of presupuestos) {
                await DatabaseService.actualizarMontoGastadoPresupuesto(
                    usuarioId,
                    presupuesto.categoria,
                    mes,
                    anio
                );
            }

            this.notifyListeners();
            return true;
        } catch (error) {
            console.error("Error al actualizar presupuestos:", error);
            throw error;
        }
    }

    // OBTENER ALERTAS DE PRESUPUESTOS
    async obtenerAlertasPresupuestos(usuarioId) {
        try {
            const presupuestos = await this.obtenerPresupuestosMesActual(usuarioId);

            const alertas = {
                cercaDelLimite: [],
                excedidos: [],
                normales: []
            };

            presupuestos.forEach(presupuesto => {
                if (presupuesto.excedioLimite()) {
                    alertas.excedidos.push(presupuesto);
                } else if (presupuesto.estaCercaDelLimite()) {
                    alertas.cercaDelLimite.push(presupuesto);
                } else {
                    alertas.normales.push(presupuesto);
                }
            });

            return alertas;
        } catch (error) {
            console.error("Error al obtener alertas:", error);
            throw error;
        }
    }

    // ESTADÍSTICAS DE PRESUPUESTOS
    async obtenerEstadisticasPresupuestos(usuarioId) {
        try {
            const presupuestos = await this.obtenerPresupuestosMesActual(usuarioId);

            if (presupuestos.length === 0) {
                return {
                    totalPresupuestos: 0,
                    totalLimite: 0,
                    totalGastado: 0,
                    porcentajePromedio: 0,
                    presupuestosExcedidos: 0,
                    presupuestosCercaDelLimite: 0
                };
            }

            const totalLimite = presupuestos.reduce((sum, p) => sum + p.montoLimite, 0);
            const totalGastado = presupuestos.reduce((sum, p) => sum + p.montoGastado, 0);
            const porcentajePromedio = (totalGastado / totalLimite) * 100;
            const presupuestosExcedidos = presupuestos.filter(p => p.excedioLimite()).length;
            const presupuestosCercaDelLimite = presupuestos.filter(p =>
                p.estaCercaDelLimite() && !p.excedioLimite()
            ).length;

            return {
                totalPresupuestos: presupuestos.length,
                totalLimite,
                totalGastado,
                porcentajePromedio,
                presupuestosExcedidos,
                presupuestosCercaDelLimite,
                montoRestante: totalLimite - totalGastado
            };
        } catch (error) {
            console.error("Error al obtener estadísticas de presupuestos:", error);
            throw error;
        }
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