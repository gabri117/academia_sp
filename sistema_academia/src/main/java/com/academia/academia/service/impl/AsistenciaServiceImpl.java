package com.academia.academia.service.impl;

import com.academia.academia.dto.asistencia.AsistenciaCreateDTO;
import com.academia.academia.dto.asistencia.AsistenciaResponseDTO;
import com.academia.academia.entity.Asistencia;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.SesionClase;
import com.academia.academia.entity.id.AsistenciaId;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.AsistenciaMapper;
import com.academia.academia.repository.AsistenciaRepository;
import com.academia.academia.repository.InscripcionRepository;
import com.academia.academia.repository.SesionClaseRepository;
import com.academia.academia.service.AsistenciaService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AsistenciaServiceImpl implements AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final SesionClaseRepository sesionClaseRepository;
    private final InscripcionRepository inscripcionRepository;
    private final AsistenciaMapper asistenciaMapper;

    public AsistenciaServiceImpl(
            AsistenciaRepository asistenciaRepository,
            SesionClaseRepository sesionClaseRepository,
            InscripcionRepository inscripcionRepository,
            AsistenciaMapper asistenciaMapper) {
        this.asistenciaRepository = asistenciaRepository;
        this.sesionClaseRepository = sesionClaseRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.asistenciaMapper = asistenciaMapper;
    }

    @Override
    @Transactional
    public AsistenciaResponseDTO registrar(AsistenciaCreateDTO dto) {
        SesionClase sesionClase = sesionClaseRepository
                .findById(dto.getSessionId())
                .orElseThrow(() -> new NotFoundException("Sesion de clase no encontrada"));

        Inscripcion inscripcion = inscripcionRepository
                .findById(dto.getInscripcionId())
                .orElseThrow(() -> new NotFoundException("Inscripcion no encontrada"));

        OfertaCurso ofertaSesion = sesionClase.getOferta();
        OfertaCurso ofertaInscripcion = inscripcion.getOferta();
        UUID ofertaSesionId = ofertaSesion != null ? ofertaSesion.getOfertaId() : null;
        UUID ofertaInscripcionId = ofertaInscripcion != null ? ofertaInscripcion.getOfertaId() : null;
        if (ofertaSesionId == null || ofertaInscripcionId == null || !ofertaSesionId.equals(ofertaInscripcionId)) {
            throw new ConflictException("La inscripcion no pertenece a la oferta de la sesion");
        }

        AsistenciaId id = new AsistenciaId(dto.getSessionId(), dto.getInscripcionId());
        if (asistenciaRepository.existsById(id)) {
            throw new ConflictException("La asistencia ya fue registrada");
        }

        Asistencia asistencia = new Asistencia();
        asistencia.setId(id);
        asistencia.setSesion(sesionClase);
        asistencia.setInscripcion(inscripcion);
        asistencia.setPresente(dto.isPresente());

        Asistencia guardada = asistenciaRepository.save(asistencia);
        return asistenciaMapper.toResponse(guardada);
    }

    @Override
    public List<AsistenciaResponseDTO> listarPorSesion(UUID sessionId) {
        return asistenciaRepository
                .findBySesion_SessionId(sessionId)
                .stream()
                .map(asistenciaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AsistenciaResponseDTO> listarPorInscripcion(UUID inscripcionId) {
        return asistenciaRepository
                .findByInscripcion_InscripcionId(inscripcionId)
                .stream()
                .map(asistenciaMapper::toResponse)
                .collect(Collectors.toList());
    }
}
