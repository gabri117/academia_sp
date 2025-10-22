package com.academia.academia.service.impl;

import com.academia.academia.dto.nivel.NivelCreateDTO;
import com.academia.academia.dto.nivel.NivelResponseDTO;
import com.academia.academia.dto.nivel.NivelUpdateDTO;
import com.academia.academia.entity.NivelAcademico;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.NivelMapper;
import com.academia.academia.repository.NivelAcademicoRepository;
import com.academia.academia.service.NivelService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NivelServiceImpl implements NivelService {

    private final NivelAcademicoRepository nivelAcademicoRepository;
    private final NivelMapper nivelMapper;

    public NivelServiceImpl(
            NivelAcademicoRepository nivelAcademicoRepository,
            NivelMapper nivelMapper) {
        this.nivelAcademicoRepository = nivelAcademicoRepository;
        this.nivelMapper = nivelMapper;
    }

    @Override
    public List<NivelResponseDTO> listarTodos() {
        return nivelAcademicoRepository
                .findAll()
                .stream()
                .map(nivelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NivelResponseDTO obtener(UUID nivelId) {
        NivelAcademico nivel = buscarPorId(nivelId);
        return nivelMapper.toResponse(nivel);
    }

    @Override
    @Transactional
    public NivelResponseDTO crear(NivelCreateDTO dto) {
        NivelAcademico nivel = new NivelAcademico();
        nivel.setNombre(dto.getNombre());
        try {
            NivelAcademico guardado = nivelAcademicoRepository.save(nivel);
            return nivelMapper.toResponse(guardado);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("El nombre de nivel académico ya existe.", ex);
        }
    }

    @Override
    @Transactional
    public NivelResponseDTO actualizar(UUID nivelId, NivelUpdateDTO dto) {
        NivelAcademico nivel = buscarPorId(nivelId);
        nivel.setNombre(dto.getNombre());
        try {
            NivelAcademico actualizado = nivelAcademicoRepository.save(nivel);
            return nivelMapper.toResponse(actualizado);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("El nombre de nivel académico ya existe.", ex);
        }
    }

    @Override
    @Transactional
    public void eliminar(UUID nivelId) {
        NivelAcademico nivel = buscarPorId(nivelId);
        nivelAcademicoRepository.delete(nivel);
    }

    private NivelAcademico buscarPorId(UUID nivelId) {
        return nivelAcademicoRepository
                .findById(nivelId)
                .orElseThrow(() -> new NotFoundException("Nivel académico no encontrado"));
    }
}
