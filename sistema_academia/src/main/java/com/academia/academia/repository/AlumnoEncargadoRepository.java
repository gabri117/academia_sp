package com.academia.academia.repository;

import com.academia.academia.entity.AlumnoEncargado;
import com.academia.academia.entity.id.AlumnoEncargadoId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumnoEncargadoRepository extends JpaRepository<AlumnoEncargado, AlumnoEncargadoId> {

    boolean existsById(AlumnoEncargadoId id);

    List<AlumnoEncargado> findAllByAlumno_AlumnoId(UUID alumnoId);

    List<AlumnoEncargado> findAllByEncargado_EncargadoId(UUID encargadoId);
}
