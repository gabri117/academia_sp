package com.academia.academia.mapper.pagos;

import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.dto.pagos.ReciboOfertaDetalleDTO;
import com.academia.academia.dto.pagos.ReciboOfertaFlat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ReciboConOfertasMapper {

    public List<ReciboConOfertasDTO> fromFlatRows(List<ReciboOfertaFlat> rows) {
        Map<UUID, ReciboConOfertasDTO> grouped = new LinkedHashMap<>();

        for (ReciboOfertaFlat row : rows) {
            ReciboConOfertasDTO recibo = grouped.computeIfAbsent(
                    row.reciboId(),
                    id -> {
                        ReciboConOfertasDTO dto = new ReciboConOfertasDTO();
                        dto.setReciboId(row.reciboId());
                        dto.setAlumnoId(row.alumnoId());
                        dto.setCorrelativoRecibo(row.correlativoRecibo());
                        dto.setFecha(row.fecha());
                        dto.setEstado(row.estado());
                        dto.setTotal(row.total());
                        return dto;
                    });

            if (row.ofertaId() != null) {
                ReciboOfertaDetalleDTO detalle = new ReciboOfertaDetalleDTO();
                detalle.setOfertaId(row.ofertaId());
                detalle.setNombreOferta(row.nombreOferta());
                detalle.setDia(row.dia());
                detalle.setHoraInicio(row.horaInicio());
                detalle.setHoraFinalizacion(row.horaFinalizacion());
                detalle.setInstitutoId(row.institutoId());
                detalle.setInstitutoNombre(row.institutoNombre());
                recibo.getOfertas().add(detalle);
            }
        }

        return new ArrayList<>(grouped.values());
    }
}

