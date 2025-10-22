package com.academia.academia.entity.enums;

public enum CargoEstado {
    PENDIENTE("pendiente"),
    CANCELADO("cancelado");

    private final String databaseValue;

    CargoEstado(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static CargoEstado fromDatabaseValue(String value) {
        for (CargoEstado estado : values()) {
            if (estado.databaseValue.equals(value)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Unknown cargo_estado_enum value: " + value);
    }
}

