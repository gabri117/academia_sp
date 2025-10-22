package com.academia.academia.service.impl;

import com.academia.academia.dto.calificacion.CalificacionCreateDTO;
import com.academia.academia.dto.calificacion.CalificacionResponseDTO;
import com.academia.academia.entity.Calificacion;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.UnidadEvaluacion;
import com.academia.academia.entity.id.CalificacionId;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.CalificacionMapper;
import com.academia.academia.repository.CalificacionRepository;
import com.academia.academia.repository.InscripcionRepository;
import com.academia.academia.repository.UnidadEvaluacionRepository;
import com.academia.academia.service.CalificacionService;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalificacionServiceImpl implements CalificacionService {

    private static final BigDecimal NOTA_MINIMA = BigDecimal.ZERO;
    private static final BigDecimal NOTA_MAXIMA = new BigDecimal("100");

    private final CalificacionRepository calificacionRepository;
    private final InscripcionRepository inscripcionRepository;
    private final UnidadEvaluacionRepository unidadEvaluacionRepository;
    private final CalificacionMapper calificacionMapper;

    public CalificacionServiceImpl(
            CalificacionRepository calificacionRepository,
            InscripcionRepository inscripcionRepository,
            UnidadEvaluacionRepository unidadEvaluacionRepository,
            CalificacionMapper calificacionMapper) {
        this.calificacionRepository = calificacionRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.unidadEvaluacionRepository = unidadEvaluacionRepository;
        this.calificacionMapper = calificacionMapper;
    }

    @Override
    @Transactional
    public CalificacionResponseDTO registrar(CalificacionCreateDTO dto) {
        validarNota(dto.getNota());

        Inscripcion inscripcion = inscripcionRepository
                .findById(dto.getInscripcionId())
                .orElseThrow(() -> new NotFoundException("Inscripcion no encontrada"));

        UnidadEvaluacion unidadEvaluacion = unidadEvaluacionRepository
                .findById(dto.getEvaluacionId())
                .orElseThrow(() -> new NotFoundException("Unidad de evaluacion no encontrada"));

        OfertaCurso ofertaInscripcion = inscripcion.getOferta();
        OfertaCurso ofertaUnidad = unidadEvaluacion.getOferta();
        UUID ofertaInscripcionId = ofertaInscripcion != null ? ofertaInscripcion.getOfertaId() : null;
        UUID ofertaUnidadId = ofertaUnidad != null ? ofertaUnidad.getOfertaId() : null;
        if (ofertaInscripcionId == null || ofertaUnidadId == null || !ofertaInscripcionId.equals(ofertaUnidadId)) {
            throw new ConflictException("La evaluacion no pertenece a la misma oferta de la inscripcion");
        }

        CalificacionId id = new CalificacionId(dto.getInscripcionId(), dto.getEvaluacionId());
        if (calificacionRepository.existsById(id)) {
            throw new ConflictException("La calificacion ya fue registrada");
        }

        Calificacion calificacion = new Calificacion();
        calificacion.setId(id);
        calificacion.setInscripcion(inscripcion);
        calificacion.setUnidadEvaluacion(unidadEvaluacion);
        calificacion.setNota(dto.getNota());
        calificacion.setObservaciones(dto.getObservaciones());

        Calificacion guardada = calificacionRepository.save(calificacion);
        return calificacionMapper.toResponse(guardada);
    }

    @Override
    public List<CalificacionResponseDTO> listarPorInscripcion(UUID inscripcionId) {
        return calificacionRepository
                .findByInscripcion_InscripcionId(inscripcionId)
                .stream()
                .map(calificacionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CalificacionResponseDTO> listarPorOferta(UUID ofertaId) {
        return calificacionRepository
                .findByUnidadEvaluacion_Oferta_OfertaId(ofertaId)
                .stream()
                .map(calificacionMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void validarNota(BigDecimal nota) {
        if (nota == null) {
            throw new ConflictException("La nota es obligatoria");
        }
        if (nota.compareTo(NOTA_MINIMA) < 0 || nota.compareTo(NOTA_MAXIMA) > 0) {
            throw new ConflictException("La nota debe estar en el rango de 0 a 100");
        }
    }
}
