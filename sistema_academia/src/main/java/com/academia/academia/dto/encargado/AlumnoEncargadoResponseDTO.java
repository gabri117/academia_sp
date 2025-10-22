package com.academia.academia.dto.encargado;

import java.util.UUID;

public class AlumnoEncargadoResponseDTO {

    private UUID alumnoId;
    private String alumnoNombreCompleto;
    private UUID encargadoId;
    private String encargadoNombreCompleto;

    public UUID getAlumnoId() {
        return alumnoId;
    }

    public void setAlumnoId(UUID alumnoId) {
        this.alumnoId = alumnoId;
    }

    public String getAlumnoNombreCompleto() {
        return alumnoNombreCompleto;
    }

    public void setAlumnoNombreCompleto(String alumnoNombreCompleto) {
        this.alumnoNombreCompleto = alumnoNombreCompleto;
    }

    public UUID getEncargadoId() {
        return encargadoId;
    }

    public void setEncargadoId(UUID encargadoId) {
        this.encargadoId = encargadoId;
    }

    public String getEncargadoNombreCompleto() {
        return encargadoNombreCompleto;
    }

    public void setEncargadoNombreCompleto(String encargadoNombreCompleto) {
        this.encargadoNombreCompleto = encargadoNombreCompleto;
    }
}
