package com.academia.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tarifacurso")
public class TarifaCurso {

    @Id
    @Column(name = "tarifa_id", nullable = false)
    private UUID tarifaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_id", nullable = false)
    private OfertaCurso oferta;

    @Column(name = "monto_inscripcion", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoInscripcion;

    @Column(name = "monto_mensualidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoMensualidad;

    @PrePersist
    public void prePersist() {
        if (tarifaId == null) {
            tarifaId = UUID.randomUUID();
        }
    }

    public UUID getTarifaId() {
        return tarifaId;
    }

    public void setTarifaId(UUID tarifaId) {
        this.tarifaId = tarifaId;
    }

    public OfertaCurso getOferta() {
        return oferta;
    }

    public void setOferta(OfertaCurso oferta) {
        this.oferta = oferta;
    }

    public BigDecimal getMontoInscripcion() {
        return montoInscripcion;
    }

    public void setMontoInscripcion(BigDecimal montoInscripcion) {
        this.montoInscripcion = montoInscripcion;
    }

    public BigDecimal getMontoMensualidad() {
        return montoMensualidad;
    }

    public void setMontoMensualidad(BigDecimal montoMensualidad) {
        this.montoMensualidad = montoMensualidad;
    }
}

