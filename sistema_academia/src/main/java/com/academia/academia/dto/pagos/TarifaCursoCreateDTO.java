package com.academia.academia.dto.pagos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class TarifaCursoCreateDTO {

    @NotNull
    private UUID ofertaId;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal montoInscripcion;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal montoMensualidad;

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
