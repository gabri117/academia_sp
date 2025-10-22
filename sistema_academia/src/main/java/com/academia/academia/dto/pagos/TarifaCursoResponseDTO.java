package com.academia.academia.dto.pagos;

import java.math.BigDecimal;
import java.util.UUID;

public class TarifaCursoResponseDTO {

    private UUID tarifaId;
    private UUID ofertaId;
    private BigDecimal montoInscripcion;
    private BigDecimal montoMensualidad;

    public UUID getTarifaId() {
        return tarifaId;
    }

    public void setTarifaId(UUID tarifaId) {
        this.tarifaId = tarifaId;
    }

    public UUID getOfertaId() {
        return ofertaId;
    }

    public void setOfertaId(UUID ofertaId) {
        this.ofertaId = ofertaId;
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
