package com.academia.academia.service.impl;

import com.academia.academia.dto.sesiones.SesionClaseResponseDTO;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.SesionClase;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.SesionClaseMapper;
import com.academia.academia.repository.OfertaCursoRepository;
import com.academia.academia.repository.SesionClaseRepository;
import com.academia.academia.service.SesionClaseService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SesionClaseServiceImpl implements SesionClaseService {

    private final SesionClaseRepository sesionClaseRepository;
    private final OfertaCursoRepository ofertaCursoRepository;
    private final SesionClaseMapper sesionClaseMapper;

    public SesionClaseServiceImpl(
            SesionClaseRepository sesionClaseRepository,
            OfertaCursoRepository ofertaCursoRepository,
            SesionClaseMapper sesionClaseMapper) {
        this.sesionClaseRepository = sesionClaseRepository;
        this.ofertaCursoRepository = ofertaCursoRepository;
        this.sesionClaseMapper = sesionClaseMapper;
    }

    @Override
    @Transactional
    public SesionClaseResponseDTO crearSesion(UUID ofertaId, LocalDate fecha) {
        OfertaCurso ofertaCurso = ofertaCursoRepository
                .findById(ofertaId)
                .orElseThrow(() -> new NotFoundException("Oferta de curso no encontrada"));

        SesionClase sesionClase = new SesionClase();
        sesionClase.setOferta(ofertaCurso);
        sesionClase.setFecha(fecha);

        SesionClase guardada = sesionClaseRepository.save(sesionClase);
        return sesionClaseMapper.toResponse(guardada);
    }

    @Override
    public List<SesionClaseResponseDTO> listarPorOferta(UUID ofertaId) {
        return sesionClaseRepository
                .findByOferta_OfertaId(ofertaId)
                .stream()
                .map(sesionClaseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SesionClaseResponseDTO> listarPorRangoFecha(UUID ofertaId, LocalDate desde, LocalDate hasta) {
        return sesionClaseRepository
                .findByOferta_OfertaIdAndFechaBetween(ofertaId, desde, hasta)
                .stream()
                .map(sesionClaseMapper::toResponse)
                .collect(Collectors.toList());
    }
}
