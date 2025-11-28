export class Usuario {
    constructor(id, nombreCompleto, correo, contrasena, telefono, balanceTotal, fechaRegistro) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.contrasena = contrasena;
        this.telefono = telefono;
        this.balanceTotal = balanceTotal || 0;
        this.fechaRegistro = fechaRegistro || new Date().toISOString();
    }

    static validarRegistro(nombreCompleto, correo, contrasena, telefono) {
        // Validar nombre completo
        if (!nombreCompleto || nombreCompleto.trim().length === 0) {
            throw new Error("El nombre completo es obligatorio");
        }
        if (nombreCompleto.length < 3) {
            throw new Error("El nombre debe tener al menos 3 caracteres");
        }
        if (nombreCompleto.length > 100) {
            throw new Error("El nombre no puede exceder 100 caracteres");
        }

        // Validar correo
        if (!correo || correo.trim().length === 0) {
            throw new Error("El correo electrónico es obligatorio");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            throw new Error("El formato del correo electrónico no es válido");
        }
        if (correo.length > 150) {
            throw new Error("El correo no puede exceder 150 caracteres");
        }

        // Validar contraseña
        if (!contrasena || contrasena.trim().length === 0) {
            throw new Error("La contraseña es obligatoria");
        }
        if (contrasena.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        if (contrasena.length > 50) {
            throw new Error("La contraseña no puede exceder 50 caracteres");
        }

        // Validar teléfono
        if (!telefono || telefono.trim().length === 0) {
            throw new Error("El número telefónico es obligatorio");
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
            throw new Error("El teléfono debe tener 10 dígitos");
        }

        return true;
    }

    static validarLogin(correo, contrasena) {
        if (!correo || correo.trim().length === 0) {
            throw new Error("El correo electrónico es obligatorio");
        }
        if (!contrasena || contrasena.trim().length === 0) {
            throw new Error("La contraseña es obligatoria");
        }
        return true;
    }

    // Método para ocultar información sensible
    toSafeObject() {
        return {
            id: this.id,
            nombreCompleto: this.nombreCompleto,
            correo: this.correo,
            telefono: this.telefono,
            balanceTotal: this.balanceTotal,
            fechaRegistro: this.fechaRegistro
        };
    }
}