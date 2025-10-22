package com.academia.academia.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class AlumnoEncargadoId implements Serializable {

    @Column(name = "alumno_id", nullable = false)
    private UUID alumnoId;

    @Column(name = "encargado_id", nullable = false)
    private UUID encargadoId;

    public AlumnoEncargadoId() {
    }

    public AlumnoEncargadoId(UUID alumnoId, UUID encargadoId) {
        this.alumnoId = alumnoId;
        this.encargadoId = encargadoId;
    }

    public UUID getAlumnoId() {
        return alumnoId;
    }

    public void setAlumnoId(UUID alumnoId) {
        this.alumnoId = alumnoId;
    }

    public UUID getEncargadoId() {
        return encargadoId;
    }

    public void setEncargadoId(UUID encargadoId) {
        this.encargadoId = encargadoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        AlumnoEncargadoId that = (AlumnoEncargadoId) o;
        return Objects.equals(alumnoId, that.alumnoId)
            && Objects.equals(encargadoId, that.encargadoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(alumnoId, encargadoId);
    }
}
