package com.academia.academia.dto.pagos;

import com.academia.academia.entity.enums.ReciboEstado;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ReciboUpdateDTO {
    private LocalDate fecha;
    private BigDecimal total;
    private ReciboEstado estado;

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public ReciboEstado getEstado() {
        return estado;
    }

    public void setEstado(ReciboEstado estado) {
        this.estado = estado;
    }
}
