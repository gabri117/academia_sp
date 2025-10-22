package com.academia.academia.service.impl;

import com.academia.academia.dto.alumno.AlumnoCreateDTO;
import com.academia.academia.dto.alumno.AlumnoResponseDTO;
import com.academia.academia.dto.alumno.AlumnoUpdateDTO;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Establecimiento;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.AlumnoMapper;
import com.academia.academia.repository.AlumnoRepository;
import com.academia.academia.repository.EstablecimientoRepository;
import com.academia.academia.service.AlumnoService;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AlumnoServiceImpl implements AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final EstablecimientoRepository establecimientoRepository;
    private final AlumnoMapper alumnoMapper;

    public AlumnoServiceImpl(
            AlumnoRepository alumnoRepository,
            EstablecimientoRepository establecimientoRepository,
            AlumnoMapper alumnoMapper) {
        this.alumnoRepository = alumnoRepository;
        this.establecimientoRepository = establecimientoRepository;
        this.alumnoMapper = alumnoMapper;
    }

    @Override
    public Page<AlumnoResponseDTO> listar(Pageable pageable) {
        return alumnoRepository.findAll(pageable).map(alumnoMapper::toResponse);
    }

    @Override
    public AlumnoResponseDTO obtener(UUID id) {
        Alumno alumno = alumnoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));
        return alumnoMapper.toResponse(alumno);
    }

    @Override
    @Transactional
    public AlumnoResponseDTO crear(AlumnoCreateDTO dto) {
        Establecimiento establecimiento = obtenerEstablecimiento(dto.getInstitutoId());

        validarCarnetDisponible(dto.getCarnet(), null);

        Alumno alumno = new Alumno();
        alumno.setEstablecimiento(establecimiento);
        alumno.setNombre(dto.getNombre());
        alumno.setApellido(dto.getApellido());
        alumno.setTelefono(dto.getTelefono());
        alumno.setDireccion(dto.getDireccion());
        alumno.setCarnet(dto.getCarnet());
        alumno.setFechaNacimiento(dto.getFechaNacimiento());
        alumno.setEstado(dto.getEstado());

        Alumno guardado = alumnoRepository.save(alumno);
        return alumnoMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public AlumnoResponseDTO actualizar(UUID id, AlumnoUpdateDTO dto) {
        Alumno alumno = alumnoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));

        if (dto.getInstitutoId() != null) {
            Establecimiento establecimiento = obtenerEstablecimiento(dto.getInstitutoId());
            alumno.setEstablecimiento(establecimiento);
        }

        validarCarnetDisponible(dto.getCarnet(), alumno.getAlumnoId());

        alumno.setNombre(dto.getNombre());
        alumno.setApellido(dto.getApellido());
        alumno.setTelefono(dto.getTelefono());
        alumno.setDireccion(dto.getDireccion());
        alumno.setCarnet(dto.getCarnet());
        alumno.setFechaNacimiento(dto.getFechaNacimiento());
        if (dto.getEstado() != null) {
            alumno.setEstado(dto.getEstado());
        }

        Alumno actualizado = alumnoRepository.save(alumno);
        return alumnoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Alumno alumno = alumnoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));
        alumnoRepository.delete(alumno);
    }

    private Establecimiento obtenerEstablecimiento(UUID institutoId) {
        return establecimientoRepository
                .findById(institutoId)
                .orElseThrow(() -> new NotFoundException("Establecimiento no encontrado"));
    }

    private void validarCarnetDisponible(String carnet, UUID alumnoActualId) {
        if (!StringUtils.hasText(carnet)) {
            return;
        }

        alumnoRepository
                .findByCarnetIgnoreCase(carnet)
                .filter(alumno -> alumnoActualId == null || !alumno.getAlumnoId().equals(alumnoActualId))
                .ifPresent(alumno -> {
                    throw new ConflictException("El carnet especificado ya esta asignado a otro alumno");
                });
    }
}
