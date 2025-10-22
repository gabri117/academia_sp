package com.academia.academia.service.impl;

import com.academia.academia.dto.inscripcion.InscripcionCreateDTO;
import com.academia.academia.dto.inscripcion.InscripcionResponseDTO;
import com.academia.academia.dto.inscripcion.InscripcionUpdateDTO;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.enums.OfertaStatus;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.InscripcionMapper;
import com.academia.academia.repository.AlumnoRepository;
import com.academia.academia.repository.InscripcionRepository;
import com.academia.academia.repository.OfertaCursoRepository;
import com.academia.academia.service.InscripcionService;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InscripcionServiceImpl implements InscripcionService {

    private static final String ESTADO_ACTIVO = "activo";
    private static final String ESTADO_INACTIVO = "inactivo";

    private final InscripcionRepository inscripcionRepository;
    private final AlumnoRepository alumnoRepository;
    private final OfertaCursoRepository ofertaCursoRepository;
    private final InscripcionMapper inscripcionMapper;

    public InscripcionServiceImpl(
            InscripcionRepository inscripcionRepository,
            AlumnoRepository alumnoRepository,
            OfertaCursoRepository ofertaCursoRepository,
            InscripcionMapper inscripcionMapper) {
        this.inscripcionRepository = inscripcionRepository;
        this.alumnoRepository = alumnoRepository;
        this.ofertaCursoRepository = ofertaCursoRepository;
        this.inscripcionMapper = inscripcionMapper;
    }

    @Override
    public Page<InscripcionResponseDTO> listar(Pageable pageable) {
        return inscripcionRepository.findAll(pageable).map(inscripcionMapper::toResponse);
    }

    @Override
    public InscripcionResponseDTO obtener(UUID id) {
        Inscripcion inscripcion = obtenerInscripcion(id);
        return inscripcionMapper.toResponse(inscripcion);
    }

    @Override
    @Transactional
    public InscripcionResponseDTO inscribir(InscripcionCreateDTO dto) {
        Alumno alumno = alumnoRepository
                .findById(dto.getAlumnoId())
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));

        OfertaCurso ofertaCurso = ofertaCursoRepository
                .findById(dto.getOfertaId())
                .orElseThrow(() -> new NotFoundException("Oferta de curso no encontrada"));

        validarDuplicado(alumno.getAlumnoId(), ofertaCurso.getOfertaId(), null);
        validarOfertaDisponible(ofertaCurso, null);

        Inscripcion inscripcion = new Inscripcion();
        inscripcion.setAlumno(alumno);
        inscripcion.setOferta(ofertaCurso);
        inscripcion.setFechaInscripcion(dto.getFechaInscripcion());
        inscripcion.setEstado(normalizarEstado(dto.getEstado()));

        Inscripcion guardada = inscripcionRepository.save(inscripcion);
        return inscripcionMapper.toResponse(guardada);
    }

    @Override
    @Transactional
    public InscripcionResponseDTO actualizar(UUID id, InscripcionUpdateDTO dto) {
        Inscripcion inscripcion = obtenerInscripcion(id);

        UUID nuevoAlumnoId = dto.getAlumnoId();
        UUID nuevaOfertaId = dto.getOfertaId();

        Alumno alumno = inscripcion.getAlumno();
        if (!alumno.getAlumnoId().equals(nuevoAlumnoId)) {
            alumno = alumnoRepository
                    .findById(nuevoAlumnoId)
                    .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));
        }

        OfertaCurso ofertaCurso = inscripcion.getOferta();
        if (!ofertaCurso.getOfertaId().equals(nuevaOfertaId)) {
            ofertaCurso = ofertaCursoRepository
                    .findById(nuevaOfertaId)
                    .orElseThrow(() -> new NotFoundException("Oferta de curso no encontrada"));
        }

        validarDuplicado(alumno.getAlumnoId(), ofertaCurso.getOfertaId(), inscripcion.getInscripcionId());
        validarOfertaDisponible(ofertaCurso, inscripcion);

        inscripcion.setAlumno(alumno);
        inscripcion.setOferta(ofertaCurso);
        inscripcion.setFechaInscripcion(dto.getFechaInscripcion());
        inscripcion.setEstado(normalizarEstado(dto.getEstado()));

        Inscripcion actualizada = inscripcionRepository.save(inscripcion);
        return inscripcionMapper.toResponse(actualizada);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Inscripcion inscripcion = obtenerInscripcion(id);
        inscripcion.setEstado(ESTADO_INACTIVO);
        inscripcionRepository.save(inscripcion);
    }

    @Override
    public List<InscripcionResponseDTO> listarPorAlumno(UUID alumnoId) {
        return inscripcionRepository
                .findByAlumno_AlumnoId(alumnoId)
                .stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InscripcionResponseDTO> listarPorOferta(UUID ofertaId) {
        return inscripcionRepository
                .findByOferta_OfertaId(ofertaId)
                .stream()
                .map(inscripcionMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Inscripcion obtenerInscripcion(UUID id) {
        return inscripcionRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Inscripcion no encontrada"));
    }

    private void validarDuplicado(UUID alumnoId, UUID ofertaId, UUID inscripcionActualId) {
        inscripcionRepository
                .findByAlumno_AlumnoIdAndOferta_OfertaId(alumnoId, ofertaId)
                .ifPresent(existente -> {
                    if (inscripcionActualId == null
                            || !existente.getInscripcionId().equals(inscripcionActualId)) {
                        throw new ConflictException("El alumno ya esta inscrito en esta oferta");
                    }
                });
    }

    private void validarOfertaDisponible(OfertaCurso ofertaCurso, Inscripcion inscripcionActual) {
        OfertaStatus status = ofertaCurso.getStatus();
        if (status == OfertaStatus.CANCELADO || status == OfertaStatus.FINALIZADO) {
            throw new ConflictException("La oferta no permite nuevas inscripciones");
        }

        int capacidad = ofertaCurso.getCapacidad() != null ? ofertaCurso.getCapacidad() : 0;
        if (capacidad <= 0) {
            throw new ConflictException("La oferta no tiene cupo disponible");
        }

        long inscritos = inscripcionRepository.countByOferta_OfertaId(ofertaCurso.getOfertaId());
        if (inscripcionActual != null && ofertaCurso.getOfertaId().equals(inscripcionActual.getOferta().getOfertaId())) {
            inscritos = Math.max(0, inscritos - 1);
        }

        if (inscritos >= capacidad) {
            throw new ConflictException("La oferta ya alcanzo su cupo");
        }
    }

    private String normalizarEstado(String estado) {
        if (estado == null) {
            return null;
        }
        String normalizado = estado.toLowerCase(Locale.ROOT);
        if (!ESTADO_ACTIVO.equals(normalizado) && !ESTADO_INACTIVO.equals(normalizado)) {
            throw new ConflictException("Estado de inscripcion invalido. Valores permitidos: activo, inactivo");
        }
        return normalizado;
    }
}
