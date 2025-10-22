package com.academia.academia.service.impl;

import com.academia.academia.dto.oferta.OfertaCursoCreateDTO;
import com.academia.academia.dto.oferta.OfertaCursoResponseDTO;
import com.academia.academia.dto.oferta.OfertaCursoUpdateDTO;
import com.academia.academia.entity.CursoCatalogo;
import com.academia.academia.entity.Establecimiento;
import com.academia.academia.entity.GradoAcademico;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.enums.OfertaStatus;
import com.academia.academia.exception.BadRequestException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.OfertaMapper;
import com.academia.academia.repository.CursoCatalogoRepository;
import com.academia.academia.repository.EstablecimientoRepository;
import com.academia.academia.repository.GradoAcademicoRepository;
import com.academia.academia.repository.InscripcionRepository;
import com.academia.academia.repository.OfertaCursoRepository;
import com.academia.academia.service.OfertaCursoService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfertaCursoServiceImpl implements OfertaCursoService {

    private final OfertaCursoRepository ofertaCursoRepository;
    private final GradoAcademicoRepository gradoAcademicoRepository;
    private final EstablecimientoRepository establecimientoRepository;
    private final CursoCatalogoRepository cursoCatalogoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final OfertaMapper ofertaMapper;

    public OfertaCursoServiceImpl(
            OfertaCursoRepository ofertaCursoRepository,
            GradoAcademicoRepository gradoAcademicoRepository,
            EstablecimientoRepository establecimientoRepository,
            CursoCatalogoRepository cursoCatalogoRepository,
            InscripcionRepository inscripcionRepository,
            OfertaMapper ofertaMapper) {
        this.ofertaCursoRepository = ofertaCursoRepository;
        this.gradoAcademicoRepository = gradoAcademicoRepository;
        this.establecimientoRepository = establecimientoRepository;
        this.cursoCatalogoRepository = cursoCatalogoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.ofertaMapper = ofertaMapper;
    }

    @Override
    public Page<OfertaCursoResponseDTO> listar(UUID gradoId, UUID institutoId, UUID cursoId, Pageable pageable) {
        return ofertaCursoRepository
                .findAllByFilters(gradoId, institutoId, cursoId, pageable)
                .map(ofertaMapper::toResponse);
    }

    @Override
    public OfertaCursoResponseDTO obtener(UUID id) {
        OfertaCurso ofertaCurso = buscarPorId(id);
        return ofertaMapper.toResponse(ofertaCurso);
    }

    @Override
    @Transactional
    public OfertaCursoResponseDTO crear(OfertaCursoCreateDTO dto) {
        validarReglas(dto.getCapacidad(), dto.getFechaInicio(), dto.getFechaFinalizacion(), dto.getStatus());

        GradoAcademico gradoAcademico = obtenerGrado(dto.getGradoId());
        Establecimiento establecimiento = obtenerEstablecimiento(dto.getInstitutoId());
        CursoCatalogo cursoCatalogo = obtenerCurso(dto.getCursoId());

        OfertaCurso ofertaCurso = new OfertaCurso();
        ofertaCurso.setGradoAcademico(gradoAcademico);
        ofertaCurso.setEstablecimiento(establecimiento);
        ofertaCurso.setCursoCatalogo(cursoCatalogo);
        ofertaCurso.setDia(dto.getDia());
        ofertaCurso.setHoraInicio(dto.getHoraInicio());
        ofertaCurso.setHoraFinalizacion(dto.getHoraFinalizacion());
        ofertaCurso.setFechaInicio(dto.getFechaInicio());
        ofertaCurso.setFechaFinalizacion(dto.getFechaFinalizacion());
        ofertaCurso.setCapacidad(dto.getCapacidad());
        ofertaCurso.setStatus(dto.getStatus());

        OfertaCurso guardado = ofertaCursoRepository.save(ofertaCurso);
        return ofertaMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public OfertaCursoResponseDTO actualizar(UUID id, OfertaCursoUpdateDTO dto) {
        validarReglas(dto.getCapacidad(), dto.getFechaInicio(), dto.getFechaFinalizacion(), dto.getStatus());

        OfertaCurso ofertaCurso = buscarPorId(id);
        ofertaCurso.setGradoAcademico(obtenerGrado(dto.getGradoId()));
        ofertaCurso.setEstablecimiento(obtenerEstablecimiento(dto.getInstitutoId()));
        ofertaCurso.setCursoCatalogo(obtenerCurso(dto.getCursoId()));
        ofertaCurso.setDia(dto.getDia());
        ofertaCurso.setHoraInicio(dto.getHoraInicio());
        ofertaCurso.setHoraFinalizacion(dto.getHoraFinalizacion());
        ofertaCurso.setFechaInicio(dto.getFechaInicio());
        ofertaCurso.setFechaFinalizacion(dto.getFechaFinalizacion());
        ofertaCurso.setCapacidad(dto.getCapacidad());
        ofertaCurso.setStatus(dto.getStatus());

        OfertaCurso actualizado = ofertaCursoRepository.save(ofertaCurso);
        return ofertaMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        OfertaCurso ofertaCurso = buscarPorId(id);
        ofertaCurso.setStatus(OfertaStatus.FINALIZADO);

        List<Inscripcion> inscripciones = inscripcionRepository.findByOferta_OfertaId(id);
        for (Inscripcion inscripcion : inscripciones) {
            inscripcion.setEstado("inactivo");
        }

        ofertaCursoRepository.save(ofertaCurso);
        if (!inscripciones.isEmpty()) {
            inscripcionRepository.saveAll(inscripciones);
        }
    }

    private void validarReglas(int capacidad, LocalDate fechaInicio, LocalDate fechaFinalizacion, OfertaStatus status) {
        if (capacidad <= 0) {
            throw new BadRequestException("La capacidad debe ser mayor a cero");
        }

        if (fechaInicio == null || fechaFinalizacion == null) {
            throw new BadRequestException("Las fechas de inicio y finalizacion son obligatorias");
        }

        if (!fechaInicio.isBefore(fechaFinalizacion)) {
            throw new BadRequestException("La fecha de inicio debe ser anterior a la fecha de finalizacion");
        }

        if (status == null) {
            throw new BadRequestException("El estado de la oferta es obligatorio");
        }
    }

    private OfertaCurso buscarPorId(UUID id) {
        return ofertaCursoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Oferta de curso no encontrada"));
    }

    private GradoAcademico obtenerGrado(UUID gradoId) {
        return gradoAcademicoRepository
                .findById(gradoId)
                .orElseThrow(() -> new NotFoundException("Grado academico no encontrado"));
    }

    private Establecimiento obtenerEstablecimiento(UUID institutoId) {
        return establecimientoRepository
                .findById(institutoId)
                .orElseThrow(() -> new NotFoundException("Establecimiento no encontrado"));
    }

    private CursoCatalogo obtenerCurso(UUID cursoId) {
        return cursoCatalogoRepository
                .findById(cursoId)
                .orElseThrow(() -> new NotFoundException("Curso de catalogo no encontrado"));
    }
}
