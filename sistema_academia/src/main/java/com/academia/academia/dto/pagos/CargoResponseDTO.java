package com.academia.academia.dto.pagos;

import com.academia.academia.entity.enums.CargoEstado;
import com.academia.academia.entity.enums.Mes;
import java.math.BigDecimal;
import java.util.UUID;

public class CargoResponseDTO {

    private UUID cargoId;
    private UUID tarifaId;
    private Mes periodoMes;
    private String concepto;
    private BigDecimal monto;
    private CargoEstado estado;

    public UUID getCargoId() {
        return cargoId;
    }

    public void setCargoId(UUID cargoId) {
        this.cargoId = cargoId;
    }

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
