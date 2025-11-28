export class Transaccion {
    constructor(id, usuarioId, monto, tipo, categoria, fecha, descripcion) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.monto = parseFloat(monto);
        this.tipo = tipo; // 'ingreso' o 'gasto'
        this.categoria = categoria;
        this.fecha = fecha || new Date().toISOString();
        this.descripcion = descripcion || '';
    }

    static TIPOS = {
        INGRESO: 'ingreso',
        GASTO: 'gasto'
    };

    static CATEGORIAS_GASTOS = [
        'Alimentación',
        'Transporte',
        'Entretenimiento',
        'Salud',
        'Educación',
        'Servicios',
        'Compras',
        'Otros Gastos'
    ];

    static CATEGORIAS_INGRESOS = [
        'Salario',
        'Freelance',
        'Inversiones',
        'Ventas',
        'Regalos',
        'Otros Ingresos'
    ];

    static validar(monto, tipo, categoria) {
        // Validar monto
        if (!monto || monto === null || monto === undefined) {
            throw new Error("El monto es obligatorio");
        }
        const montoNum = parseFloat(monto);
        if (isNaN(montoNum)) {
            throw new Error("El monto debe ser un número válido");
        }
        if (montoNum <= 0) {
            throw new Error("El monto debe ser mayor a 0");
        }
        if (montoNum > 999999999) {
            throw new Error("El monto es demasiado grande");
        }

        // Validar tipo
        if (!tipo || tipo.trim().length === 0) {
            throw new Error("El tipo de transacción es obligatorio");
        }
        if (tipo !== this.TIPOS.INGRESO && tipo !== this.TIPOS.GASTO) {
            throw new Error("El tipo debe ser 'ingreso' o 'gasto'");
        }

        // Validar categoría
        if (!categoria || categoria.trim().length === 0) {
            throw new Error("La categoría es obligatoria");
        }
        if (categoria.length > 50) {
            throw new Error("La categoría no puede exceder 50 caracteres");
        }

        return true;
    }

    static validarDescripcion(descripcion) {
        if (descripcion && descripcion.length > 200) {
            throw new Error("La descripción no puede exceder 200 caracteres");
        }
        return true;
    }
}