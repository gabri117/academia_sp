package com.academia.academia.entity.enums;

public enum ReciboEstado {
    EMITIDO("EMITIDO"),
    ANULADO("ANULADO");

    private final String databaseValue;

    ReciboEstado(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static ReciboEstado fromDatabaseValue(String value) {
        if (value != null) {
            for (ReciboEstado estado : values()) {
                if (estado.databaseValue.equalsIgnoreCase(value)) {
                    return estado;
                }
            }
        }
        throw new IllegalArgumentException("Unknown recibo_estado_enum value: " + value);
    }
}

