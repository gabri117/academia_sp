package com.academia.academia.entity;

import com.academia.academia.entity.id.AsistenciaId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "asistencia")
public class Asistencia {

    @EmbeddedId
    private AsistenciaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("sessionId")
    @JoinColumn(name = "session_id", nullable = false)
    private SesionClase sesion;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("inscripcionId")
    @JoinColumn(name = "inscripcion_id", nullable = false)
    private Inscripcion inscripcion;

    @Column(name = "presente", nullable = false)
    private boolean presente;

    public AsistenciaId getId() {
        return id;
    }

    public void setId(AsistenciaId id) {
        this.id = id;
    }

    public SesionClase getSesion() {
        return sesion;
    }

    public void setSesion(SesionClase sesion) {
        this.sesion = sesion;
    }

    public Inscripcion getInscripcion() {
        return inscripcion;
    }

    public void setInscripcion(Inscripcion inscripcion) {
        this.inscripcion = inscripcion;
    }

    public boolean isPresente() {
        return presente;
    }

    public void setPresente(boolean presente) {
        this.presente = presente;
    }
}

