package com.academia.academia.dto.pagos;

import com.academia.academia.entity.enums.CargoEstado;
import com.academia.academia.entity.enums.Mes;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public class CargoCreateDTO {

    @NotNull
    private UUID tarifaId;

    @NotNull
    private Mes periodoMes;

    @NotBlank
    @Size(max = 30)
    private String concepto;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal monto;

    private CargoEstado estado = CargoEstado.PENDIENTE;

    public UUID getTarifaId() {
        return tarifaId;
    }

    public void setTarifaId(UUID tarifaId) {
        this.tarifaId = tarifaId;
    }

    public Mes getPeriodoMes() {
        return periodoMes;
    }

    public void setPeriodoMes(Mes periodoMes) {
        this.periodoMes = periodoMes;
    }

    public String getConcepto() {
        return concepto;
    }

    public void setConcepto(String concepto) {
        this.concepto = concepto;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public CargoEstado getEstado() {
        return estado;
    }

    public void setEstado(CargoEstado estado) {
        this.estado = estado;
    }
}
