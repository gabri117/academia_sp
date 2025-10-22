package com.academia.academia.entity.enums;

public enum OfertaStatus {
    PROGRAMADO("programado"),
    EN_CURSO("en_curso"),
    FINALIZADO("finalizado"),
    CANCELADO("cancelado");

    private final String databaseValue;

    OfertaStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static OfertaStatus fromDatabaseValue(String value) {
        for (OfertaStatus status : values()) {
            if (status.databaseValue.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown oferta_status_enum value: " + value);
    }
}
