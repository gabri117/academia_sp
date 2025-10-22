package com.academia.academia.entity.enums;

public enum Mes {
    ENERO("enero"),
    FEBRERO("febrero"),
    MARZO("marzo"),
    ABRIL("abril"),
    MAYO("mayo"),
    JUNIO("junio"),
    JULIO("julio"),
    AGOSTO("agosto"),
    SEPTIEMBRE("septiembre"),
    OCTUBRE("octubre"),
    NOVIEMBRE("noviembre"),
    DICIEMBRE("diciembre");

    private final String databaseValue;

    Mes(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static Mes fromDatabaseValue(String value) {
        for (Mes mes : values()) {
            if (mes.databaseValue.equals(value)) {
                return mes;
            }
        }
        throw new IllegalArgumentException("Unknown mes_enum value: " + value);
    }
}

