package com.academia.academia.dto.pagos;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class EstadoCuentaResponseDTO {

    private UUID alumnoId;
    private List<EstadoCuentaPeriodoDTO> periodos;
    private List<ReciboConOfertasDTO> recibos;
    private BigDecimal saldoTotal;

    public UUID getAlumnoId() {
        return alumnoId;
    }

    public void setAlumnoId(UUID alumnoId) {
        this.alumnoId = alumnoId;
    }

    public List<EstadoCuentaPeriodoDTO> getPeriodos() {
        return periodos;
    }

    public void setPeriodos(List<EstadoCuentaPeriodoDTO> periodos) {
        this.periodos = periodos;
    }

    public List<ReciboConOfertasDTO> getRecibos() {
        return recibos;
    }

    public void setRecibos(List<ReciboConOfertasDTO> recibos) {
        this.recibos = recibos;
    }

    public BigDecimal getSaldoTotal() {
        return saldoTotal;
    }

    public void setSaldoTotal(BigDecimal saldoTotal) {
        this.saldoTotal = saldoTotal;
    }
}
