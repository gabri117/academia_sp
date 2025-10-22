package com.academia.academia.entity;

import com.academia.academia.entity.id.CalificacionId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "calificacion")
public class Calificacion {

    @EmbeddedId
    private CalificacionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("inscripcionId")
    @JoinColumn(name = "inscripcion_id", nullable = false)
    private Inscripcion inscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("evaluacionId")
    @JoinColumn(name = "evaluacion_id", nullable = false)
    private UnidadEvaluacion unidadEvaluacion;

    @Column(name = "nota", nullable = false, precision = 5, scale = 2)
    private BigDecimal nota;

    @Column(name = "observaciones", columnDefinition = "text")
    private String observaciones;

    public CalificacionId getId() {
        return id;
    }

    public void setId(CalificacionId id) {
        this.id = id;
    }

    public Inscripcion getInscripcion() {
        return inscripcion;
    }

    public void setInscripcion(Inscripcion inscripcion) {
        this.inscripcion = inscripcion;
    }

    public UnidadEvaluacion getUnidadEvaluacion() {
        return unidadEvaluacion;
    }

    public void setUnidadEvaluacion(UnidadEvaluacion unidadEvaluacion) {
        this.unidadEvaluacion = unidadEvaluacion;
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

