package com.academia.academia.dto.pagos;

import com.academia.academia.entity.enums.ReciboEstado;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ReciboResponseDTO {

    private UUID reciboId;
    private UUID alumnoId;
    private String correlativoRecibo;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;
    private BigDecimal total;
    private ReciboEstado estado;

    public UUID getReciboId() {
        return reciboId;
    }

    public void setReciboId(UUID reciboId) {
        this.reciboId = reciboId;
    }

    public UUID getAlumnoId() {
        return alumnoId;
    }

    public void setAlumnoId(UUID alumnoId) {
        this.alumnoId = alumnoId;
    }

    public String getCorrelativoRecibo() {
        return correlativoRecibo;
    }

    public void setCorrelativoRecibo(String correlativoRecibo) {
        this.correlativoRecibo = correlativoRecibo;
    }

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
