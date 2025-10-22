package com.academia.academia.service;

import com.academia.academia.dto.encargado.AlumnoEncargadoResponseDTO;
import com.academia.academia.dto.encargado.VinculoAlumnoEncargadoRequest;
import java.util.List;
import java.util.UUID;

public interface AlumnoEncargadoService {

    AlumnoEncargadoResponseDTO vincular(VinculoAlumnoEncargadoRequest request);

    void desvincular(UUID alumnoId, UUID encargadoId);

    List<AlumnoEncargadoResponseDTO> listarEncargadosDeAlumno(UUID alumnoId);

    List<AlumnoEncargadoResponseDTO> listarAlumnosDeEncargado(UUID encargadoId);
}
