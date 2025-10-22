package com.academia.academia.dto.encargado;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class VinculoAlumnoEncargadoRequest {

    @NotNull
    private UUID alumnoId;

    @NotNull
    private UUID encargadoId;

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
}
