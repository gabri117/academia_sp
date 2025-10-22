package com.academia.academia.repository;

import com.academia.academia.entity.Alumno;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumnoRepository extends JpaRepository<Alumno, UUID> {

    Optional<Alumno> findByCarnetIgnoreCase(String carnet);

    boolean existsByCarnetIgnoreCase(String carnet);
}
