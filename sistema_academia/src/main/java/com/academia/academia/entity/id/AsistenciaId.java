package com.academia.academia.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class AsistenciaId implements Serializable {

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "inscripcion_id", nullable = false)
    private UUID inscripcionId;

    public AsistenciaId() {
    }

    public AsistenciaId(UUID sessionId, UUID inscripcionId) {
        this.sessionId = sessionId;
        this.inscripcionId = inscripcionId;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getInscripcionId() {
        return inscripcionId;
    }

    public void setInscripcionId(UUID inscripcionId) {
        this.inscripcionId = inscripcionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AsistenciaId that = (AsistenciaId) o;
        return Objects.equals(sessionId, that.sessionId)
            && Objects.equals(inscripcionId, that.inscripcionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sessionId, inscripcionId);
    }
}

