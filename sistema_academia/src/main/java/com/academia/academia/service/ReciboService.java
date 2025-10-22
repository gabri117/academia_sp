package com.academia.academia.service;

import com.academia.academia.dto.pagos.DetalleReciboCreateDTO;
import com.academia.academia.dto.pagos.DetalleReciboResponseDTO;
import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.dto.pagos.ReciboCreateDTO;
import com.academia.academia.dto.pagos.ReciboResponseDTO;
import com.academia.academia.dto.pagos.ReciboUpdateDTO;
import com.academia.academia.entity.enums.ReciboEstado;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReciboService {

    ReciboResponseDTO registrar(ReciboCreateDTO dto);

    DetalleReciboResponseDTO registrarDetalle(DetalleReciboCreateDTO dto);

    List<ReciboResponseDTO> listarPorAlumno(UUID alumnoId);

    List<DetalleReciboResponseDTO> listarDetalles(UUID reciboId);

    ReciboResponseDTO obtenerPorId(UUID id);

    ReciboResponseDTO actualizar(UUID id, ReciboUpdateDTO dto);

    List<ReciboConOfertasDTO> buscarRecibosConOfertas(
            UUID alumnoId,
            ReciboEstado estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta);
}

