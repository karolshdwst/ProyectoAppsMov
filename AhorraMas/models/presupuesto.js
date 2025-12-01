export class Presupuesto {
    constructor(id, usuarioId, categoria, montoLimite, montoGastado, mes, anio, fechaCreacion) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.categoria = categoria;
        this.montoLimite = parseFloat(montoLimite);
        this.montoGastado = parseFloat(montoGastado) || 0;
        this.mes = mes || new Date().getMonth() + 1; // 1-12
        this.anio = anio || new Date().getFullYear();
        this.fechaCreacion = fechaCreacion || new Date().toISOString();
    }

    static validar(categoria, montoLimite) {
        // Validar categoría
        if (!categoria || categoria.trim().length === 0) {
            throw new Error("La categoría es obligatoria");
        }
        if (categoria.length > 50) {
            throw new Error("La categoría no puede exceder 50 caracteres");
        }

        // Validar monto límite
        if (!montoLimite || montoLimite === null || montoLimite === undefined) {
            throw new Error("El monto límite es obligatorio");
        }
        const montoNum = parseFloat(montoLimite);
        if (isNaN(montoNum)) {
            throw new Error("El monto debe ser un número válido");
        }
        if (montoNum <= 0) {
            throw new Error("El monto límite debe ser mayor a 0");
        }
        if (montoNum > 999999999) {
            throw new Error("El monto límite es demasiado grande");
        }

        return true;
    }

    // Calcular porcentaje gastado
    getPorcentajeGastado() {
        if (this.montoLimite === 0) return 0;
        return (this.montoGastado / this.montoLimite) * 100;
    }

    // Calcular monto restante
    getMontoRestante() {
        return this.montoLimite - this.montoGastado;
    }

    // Verificar si está cerca del límite (80%)
    estaCercaDelLimite() {
        return this.getPorcentajeGastado() >= 80;
    }

    // Verificar si excedió el límite
    excedioLimite() {
        return this.montoGastado > this.montoLimite;
    }
}