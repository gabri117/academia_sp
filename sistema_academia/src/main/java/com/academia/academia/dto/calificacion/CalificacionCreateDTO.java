package com.academia.academia.dto.calificacion;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class CalificacionCreateDTO {

    @NotNull
    private UUID inscripcionId;

    @NotNull
    private UUID evaluacionId;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal nota;

    private String observaciones;

    public UUID getInscripcionId() {
        return inscripcionId;
    }

    public void setInscripcionId(UUID inscripcionId) {
        this.inscripcionId = inscripcionId;
    }

    public UUID getEvaluacionId() {
        return evaluacionId;
    }

    public void setEvaluacionId(UUID evaluacionId) {
        this.evaluacionId = evaluacionId;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
