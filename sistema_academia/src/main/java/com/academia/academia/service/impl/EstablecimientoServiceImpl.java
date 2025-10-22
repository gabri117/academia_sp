package com.academia.academia.service.impl;

import com.academia.academia.dto.establecimiento.EstablecimientoCreateDTO;
import com.academia.academia.dto.establecimiento.EstablecimientoResponseDTO;
import com.academia.academia.dto.establecimiento.EstablecimientoUpdateDTO;
import com.academia.academia.entity.Establecimiento;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.EstablecimientoMapper;
import com.academia.academia.repository.EstablecimientoRepository;
import com.academia.academia.service.EstablecimientoService;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstablecimientoServiceImpl implements EstablecimientoService {

    private final EstablecimientoRepository establecimientoRepository;
    private final EstablecimientoMapper establecimientoMapper;

    public EstablecimientoServiceImpl(
            EstablecimientoRepository establecimientoRepository,
            EstablecimientoMapper establecimientoMapper) {
        this.establecimientoRepository = establecimientoRepository;
        this.establecimientoMapper = establecimientoMapper;
    }

    @Override
    public Page<EstablecimientoResponseDTO> listar(Pageable pageable) {
        return establecimientoRepository
                .findAll(pageable)
                .map(establecimientoMapper::toResponse);
    }

    @Override
    public EstablecimientoResponseDTO obtener(UUID institutoId) {
        Establecimiento establecimiento = buscarPorId(institutoId);
        return establecimientoMapper.toResponse(establecimiento);
    }

    @Override
    @Transactional
    public EstablecimientoResponseDTO crear(EstablecimientoCreateDTO dto) {
        Establecimiento establecimiento = new Establecimiento();
        establecimiento.setNombre(dto.getNombre());
        establecimiento.setDireccion(dto.getDireccion());
        establecimiento.setNombreDirector(dto.getNombreDirector());
        establecimiento.setTelefono(dto.getTelefono());
        establecimiento.setJornada(dto.getJornada());

        Establecimiento guardado = establecimientoRepository.save(establecimiento);
        return establecimientoMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public EstablecimientoResponseDTO actualizar(UUID institutoId, EstablecimientoUpdateDTO dto) {
        Establecimiento establecimiento = buscarPorId(institutoId);
        establecimiento.setNombre(dto.getNombre());
        establecimiento.setDireccion(dto.getDireccion());
        establecimiento.setNombreDirector(dto.getNombreDirector());
        establecimiento.setTelefono(dto.getTelefono());
        establecimiento.setJornada(dto.getJornada());

        Establecimiento actualizado = establecimientoRepository.save(establecimiento);
        return establecimientoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID institutoId) {
        Establecimiento establecimiento = buscarPorId(institutoId);
        try {
            establecimientoRepository.delete(establecimiento);
            establecimientoRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "No se puede eliminar el establecimiento: está referenciado por otros registros.",
                    ex);
        }
    }

    private Establecimiento buscarPorId(UUID institutoId) {
        return establecimientoRepository
                .findById(institutoId)
                .orElseThrow(() -> new NotFoundException("Establecimiento no encontrado"));
    }
}
