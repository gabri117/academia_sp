package com.academia.academia.service.impl;

import com.academia.academia.dto.grado.GradoCreateDTO;
import com.academia.academia.dto.grado.GradoResponseDTO;
import com.academia.academia.dto.grado.GradoUpdateDTO;
import com.academia.academia.entity.GradoAcademico;
import com.academia.academia.entity.NivelAcademico;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.GradoMapper;
import com.academia.academia.repository.GradoAcademicoRepository;
import com.academia.academia.repository.NivelAcademicoRepository;
import com.academia.academia.service.GradoService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GradoServiceImpl implements GradoService {

    private final GradoAcademicoRepository gradoAcademicoRepository;
    private final NivelAcademicoRepository nivelAcademicoRepository;
    private final GradoMapper gradoMapper;

    public GradoServiceImpl(
            GradoAcademicoRepository gradoAcademicoRepository,
            NivelAcademicoRepository nivelAcademicoRepository,
            GradoMapper gradoMapper) {
        this.gradoAcademicoRepository = gradoAcademicoRepository;
        this.nivelAcademicoRepository = nivelAcademicoRepository;
        this.gradoMapper = gradoMapper;
    }

    @Override
    public List<GradoResponseDTO> listarTodos() {
        return gradoAcademicoRepository
                .findAll()
                .stream()
                .map(gradoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GradoResponseDTO> listarPorNivel(UUID nivelId) {
        asegurarNivelExiste(nivelId);
        return gradoAcademicoRepository
                .findAll()
                .stream()
                .filter(grado -> {
                    NivelAcademico nivel = grado.getNivelAcademico();
                    return nivel != null && nivelId.equals(nivel.getNivelId());
                })
                .map(gradoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GradoResponseDTO obtener(UUID gradoId) {
        GradoAcademico grado = buscarPorId(gradoId);
        return gradoMapper.toResponse(grado);
    }

    @Override
    @Transactional
    public GradoResponseDTO crear(GradoCreateDTO dto) {
        NivelAcademico nivel = obtenerNivel(dto.getNivelId());

        GradoAcademico grado = new GradoAcademico();
        grado.setNivelAcademico(nivel);
        grado.setNombre(dto.getNombre());

        try {
            GradoAcademico guardado = gradoAcademicoRepository.save(grado);
            return gradoMapper.toResponse(guardado);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Ya existe un grado con ese nombre para el nivel indicado.", ex);
        }
    }

    @Override
    @Transactional
    public GradoResponseDTO actualizar(UUID gradoId, GradoUpdateDTO dto) {
        GradoAcademico grado = buscarPorId(gradoId);
        NivelAcademico nivel = obtenerNivel(dto.getNivelId());

        grado.setNivelAcademico(nivel);
        grado.setNombre(dto.getNombre());

        try {
            GradoAcademico actualizado = gradoAcademicoRepository.save(grado);
            return gradoMapper.toResponse(actualizado);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Ya existe un grado con ese nombre para el nivel indicado.", ex);
        }
    }

    @Override
    @Transactional
    public void eliminar(UUID gradoId) {
        GradoAcademico grado = buscarPorId(gradoId);
        gradoAcademicoRepository.delete(grado);
    }

    private GradoAcademico buscarPorId(UUID gradoId) {
        return gradoAcademicoRepository
                .findById(gradoId)
                .orElseThrow(() -> new NotFoundException("Grado académico no encontrado"));
    }

    private NivelAcademico obtenerNivel(UUID nivelId) {
        return nivelAcademicoRepository
                .findById(nivelId)
                .orElseThrow(() -> new NotFoundException("Nivel académico no encontrado"));
    }

    private void asegurarNivelExiste(UUID nivelId) {
        if (!nivelAcademicoRepository.existsById(nivelId)) {
            throw new NotFoundException("Nivel académico no encontrado");
        }
    }
}
