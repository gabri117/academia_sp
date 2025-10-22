package com.academia.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "unidadevaluacion")
public class UnidadEvaluacion {

    @Id
    @Column(name = "evaluacion_id", nullable = false)
    private UUID evaluacionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_id", nullable = false)
    private OfertaCurso oferta;

    @Column(name = "nombre", nullable = false, length = 25)
    private String nombre;

    @PrePersist
    public void prePersist() {
        if (evaluacionId == null) {
            evaluacionId = UUID.randomUUID();
        }
    }

    public UUID getEvaluacionId() {
        return evaluacionId;
    }

    public void setEvaluacionId(UUID evaluacionId) {
        this.evaluacionId = evaluacionId;
    }

    public OfertaCurso getOferta() {
        return oferta;
    }

    public void setOferta(OfertaCurso oferta) {
        this.oferta = oferta;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}

