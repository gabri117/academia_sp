package com.academia.academia.dto.inscripcion;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.UUID;

public class InscripcionResponseDTO {

    private UUID id;
    private UUID alumnoId;
    private UUID ofertaId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaInscripcion;
    private String estado;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAlumnoId() {
        return alumnoId;
    }

    public void setAlumnoId(UUID alumnoId) {
        this.alumnoId = alumnoId;
    }

    public UUID getOfertaId() {
        return ofertaId;
    }

    public void setOfertaId(UUID ofertaId) {
        this.ofertaId = ofertaId;
    }

    public LocalDate getFechaInscripcion() {
        return fechaInscripcion;
    }

    public void setFechaInscripcion(LocalDate fechaInscripcion) {
        this.fechaInscripcion = fechaInscripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
