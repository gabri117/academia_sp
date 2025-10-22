package com.academia.academia.dto.evaluacion;

import java.util.UUID;

public class UnidadEvaluacionResponseDTO {

    private UUID evaluacionId;
    private UUID ofertaId;
    private String nombre;

    public UUID getEvaluacionId() {
        return evaluacionId;
    }

    public void setEvaluacionId(UUID evaluacionId) {
        this.evaluacionId = evaluacionId;
    }

    public UUID getOfertaId() {
        return ofertaId;
    }

    public void setOfertaId(UUID ofertaId) {
        this.ofertaId = ofertaId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
