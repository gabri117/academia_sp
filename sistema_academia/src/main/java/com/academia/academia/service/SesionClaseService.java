package com.academia.academia.service;

import com.academia.academia.dto.sesiones.SesionClaseResponseDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SesionClaseService {

    SesionClaseResponseDTO crearSesion(UUID ofertaId, LocalDate fecha);

    List<SesionClaseResponseDTO> listarPorOferta(UUID ofertaId);

    List<SesionClaseResponseDTO> listarPorRangoFecha(UUID ofertaId, LocalDate desde, LocalDate hasta);
}
