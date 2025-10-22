package com.academia.academia.dto.pagos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class DetalleReciboCreateDTO {

    @NotNull
    private UUID reciboId;

    @NotNull
    private UUID cargoId;

    @NotNull
    @DecimalMin(value = "0.00")
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
