package com.academia.academia.service.impl;

import com.academia.academia.dto.encargado.AlumnoEncargadoResponseDTO;
import com.academia.academia.dto.encargado.VinculoAlumnoEncargadoRequest;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.AlumnoEncargado;
import com.academia.academia.entity.Encargado;
import com.academia.academia.entity.id.AlumnoEncargadoId;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.repository.AlumnoEncargadoRepository;
import com.academia.academia.repository.AlumnoRepository;
import com.academia.academia.repository.EncargadoRepository;
import com.academia.academia.service.AlumnoEncargadoService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AlumnoEncargadoServiceImpl implements AlumnoEncargadoService {

    private final AlumnoEncargadoRepository alumnoEncargadoRepository;
    private final AlumnoRepository alumnoRepository;
    private final EncargadoRepository encargadoRepository;

    public AlumnoEncargadoServiceImpl(
            AlumnoEncargadoRepository alumnoEncargadoRepository,
            AlumnoRepository alumnoRepository,
            EncargadoRepository encargadoRepository) {
        this.alumnoEncargadoRepository = alumnoEncargadoRepository;
        this.alumnoRepository = alumnoRepository;
        this.encargadoRepository = encargadoRepository;
    }

    @Override
    @Transactional
    public AlumnoEncargadoResponseDTO vincular(VinculoAlumnoEncargadoRequest request) {
        UUID alumnoId = request.getAlumnoId();
        UUID encargadoId = request.getEncargadoId();

        Alumno alumno = alumnoRepository
                .findById(alumnoId)
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));

        Encargado encargado = encargadoRepository
                .findById(encargadoId)
                .orElseThrow(() -> new NotFoundException("Encargado no encontrado"));

        AlumnoEncargadoId id = new AlumnoEncargadoId(alumnoId, encargadoId);
        if (alumnoEncargadoRepository.existsById(id)) {
            throw new ConflictException("La relacion alumno-encargado ya existe");
        }

        AlumnoEncargado relacion = new AlumnoEncargado();
        relacion.setId(id);
        relacion.setAlumno(alumno);
        relacion.setEncargado(encargado);

        AlumnoEncargado guardado = alumnoEncargadoRepository.save(relacion);
        return toResponse(guardado);
    }

    @Override
    @Transactional
    public void desvincular(UUID alumnoId, UUID encargadoId) {
        AlumnoEncargadoId id = new AlumnoEncargadoId(alumnoId, encargadoId);
        AlumnoEncargado relacion = alumnoEncargadoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("La relacion alumno-encargado no existe"));
        alumnoEncargadoRepository.delete(relacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoEncargadoResponseDTO> listarEncargadosDeAlumno(UUID alumnoId) {
        if (!alumnoRepository.existsById(alumnoId)) {
            throw new NotFoundException("Alumno no encontrado");
        }

        return alumnoEncargadoRepository.findAllByAlumno_AlumnoId(alumnoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoEncargadoResponseDTO> listarAlumnosDeEncargado(UUID encargadoId) {
        if (!encargadoRepository.existsById(encargadoId)) {
            throw new NotFoundException("Encargado no encontrado");
        }

        return alumnoEncargadoRepository.findAllByEncargado_EncargadoId(encargadoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AlumnoEncargadoResponseDTO toResponse(AlumnoEncargado relacion) {
        AlumnoEncargadoResponseDTO response = new AlumnoEncargadoResponseDTO();
        Alumno alumno = relacion.getAlumno();
        Encargado encargado = relacion.getEncargado();

        if (alumno != null) {
            response.setAlumnoId(alumno.getAlumnoId());
            response.setAlumnoNombreCompleto(construirNombreCompleto(alumno.getNombre(), alumno.getApellido()));
        }

        if (encargado != null) {
            response.setEncargadoId(encargado.getEncargadoId());
            response.setEncargadoNombreCompleto(construirNombreCompleto(encargado.getNombre(), encargado.getApellido()));
        }

        return response;
    }

    private String construirNombreCompleto(String nombre, String apellido) {
        StringBuilder builder = new StringBuilder();
        if (nombre != null) {
            builder.append(nombre);
        }
        if (apellido != null) {
            if (builder.length() > 0) {
                builder.append(" ");
            }
            builder.append(apellido);
        }
        return builder.toString();
    }
}
