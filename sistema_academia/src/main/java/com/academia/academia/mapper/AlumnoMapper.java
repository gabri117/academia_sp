package com.academia.academia.mapper;

import com.academia.academia.dto.alumno.AlumnoResponseDTO;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Establecimiento;
import org.springframework.stereotype.Component;

@Component
public class AlumnoMapper {

    public AlumnoResponseDTO toResponse(Alumno alumno) {
        if (alumno == null) {
            return null;
        }

        AlumnoResponseDTO response = new AlumnoResponseDTO();
        response.setId(alumno.getAlumnoId());

        Establecimiento establecimiento = alumno.getEstablecimiento();
        if (establecimiento != null) {
            response.setInstitutoId(establecimiento.getInstitutoId());
        }

        response.setNombre(alumno.getNombre());
        response.setApellido(alumno.getApellido());
        response.setTelefono(alumno.getTelefono());
        response.setDireccion(alumno.getDireccion());
        response.setCarnet(alumno.getCarnet());
        response.setFechaNacimiento(alumno.getFechaNacimiento());
        response.setEstado(alumno.getEstado());
        return response;
    }
}
