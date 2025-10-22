package com.academia.academia.service.impl;

import com.academia.academia.dto.encargado.EncargadoCreateDTO;
import com.academia.academia.dto.encargado.EncargadoResponseDTO;
import com.academia.academia.dto.encargado.EncargadoUpdateDTO;
import com.academia.academia.entity.Encargado;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.EncargadoMapper;
import com.academia.academia.repository.EncargadoRepository;
import com.academia.academia.service.EncargadoService;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EncargadoServiceImpl implements EncargadoService {

    private final EncargadoRepository encargadoRepository;
    private final EncargadoMapper encargadoMapper;

    public EncargadoServiceImpl(EncargadoRepository encargadoRepository, EncargadoMapper encargadoMapper) {
        this.encargadoRepository = encargadoRepository;
        this.encargadoMapper = encargadoMapper;
    }

    @Override
    public Page<EncargadoResponseDTO> listar(Pageable pageable) {
        return encargadoRepository.findAll(pageable).map(encargadoMapper::toResponse);
    }

    @Override
    public EncargadoResponseDTO obtener(UUID id) {
        Encargado encargado = encargadoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Encargado no encontrado"));
        return encargadoMapper.toResponse(encargado);
    }

    @Override
    @Transactional
    public EncargadoResponseDTO crear(EncargadoCreateDTO dto) {
        Encargado encargado = new Encargado();
        encargado.setNombre(dto.getNombre());
        encargado.setApellido(dto.getApellido());
        encargado.setTelefono(dto.getTelefono());

        Encargado guardado = encargadoRepository.save(encargado);
        return encargadoMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public EncargadoResponseDTO actualizar(UUID id, EncargadoUpdateDTO dto) {
        Encargado encargado = encargadoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Encargado no encontrado"));

        encargado.setNombre(dto.getNombre());
        encargado.setApellido(dto.getApellido());
        encargado.setTelefono(dto.getTelefono());

        Encargado actualizado = encargadoRepository.save(encargado);
        return encargadoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Encargado encargado = encargadoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Encargado no encontrado"));
        encargadoRepository.delete(encargado);
    }
}
