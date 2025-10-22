package com.academia.academia.dto.pagos;

import com.academia.academia.entity.enums.ReciboEstado;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReciboOfertaFlat(
        UUID reciboId,
        UUID alumnoId,
        String correlativoRecibo,
        LocalDate fecha,
        ReciboEstado estado,
        BigDecimal total,
        UUID ofertaId,
        String nombreOferta,
        String dia,
        LocalTime horaInicio,
        LocalTime horaFinalizacion,
        UUID institutoId,
        String institutoNombre) {
}

