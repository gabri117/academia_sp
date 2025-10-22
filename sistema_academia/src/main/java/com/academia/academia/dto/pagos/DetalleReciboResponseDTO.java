package com.academia.academia.dto.pagos;

import java.math.BigDecimal;
import java.util.UUID;

public class DetalleReciboResponseDTO {

    private UUID reciboId;
    private UUID cargoId;
    private BigDecimal montoAplicado;

    public UUID getReciboId() {
        return reciboId;
    }

    public void setReciboId(UUID reciboId) {
        this.reciboId = reciboId;
    }

    public UUID getCargoId() {
        return cargoId;
    }

    public void setCargoId(UUID cargoId) {
        this.cargoId = cargoId;
    }

    public BigDecimal getMontoAplicado() {
        return montoAplicado;
    }

    public void setMontoAplicado(BigDecimal montoAplicado) {
        this.montoAplicado = montoAplicado;
    }
}
