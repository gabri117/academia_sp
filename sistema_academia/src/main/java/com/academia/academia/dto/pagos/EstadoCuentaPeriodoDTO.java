package com.academia.academia.dto.pagos;

import com.academia.academia.entity.enums.Mes;
import java.math.BigDecimal;

public class EstadoCuentaPeriodoDTO {

    private Mes periodo;
    private BigDecimal totalCargos;
    private BigDecimal totalPagos;
    private BigDecimal saldo;

    public Mes getPeriodo() {
        return periodo;
    }

    public void setPeriodo(Mes periodo) {
        this.periodo = periodo;
    }

    public BigDecimal getTotalCargos() {
        return totalCargos;
    }

    public void setTotalCargos(BigDecimal totalCargos) {
        this.totalCargos = totalCargos;
    }

    public BigDecimal getTotalPagos() {
        return totalPagos;
    }

    public void setTotalPagos(BigDecimal totalPagos) {
        this.totalPagos = totalPagos;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
}
