package com.academia.academia.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class CalificacionId implements Serializable {

    @Column(name = "inscripcion_id", nullable = false)
    private UUID inscripcionId;

    @Column(name = "evaluacion_id", nullable = false)
    private UUID evaluacionId;

    public CalificacionId() {
    }

    public CalificacionId(UUID inscripcionId, UUID evaluacionId) {
        this.inscripcionId = inscripcionId;
        this.evaluacionId = evaluacionId;
    }

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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        CalificacionId that = (CalificacionId) o;
        return Objects.equals(inscripcionId, that.inscripcionId)
            && Objects.equals(evaluacionId, that.evaluacionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(inscripcionId, evaluacionId);
    }
}

