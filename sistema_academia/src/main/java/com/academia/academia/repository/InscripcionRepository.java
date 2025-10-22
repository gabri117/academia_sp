package com.academia.academia.repository;

import com.academia.academia.entity.Inscripcion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscripcionRepository extends JpaRepository<Inscripcion, UUID> {

    boolean existsByAlumno_AlumnoIdAndOferta_OfertaId(UUID alumnoId, UUID ofertaId);

    Optional<Inscripcion> findByAlumno_AlumnoIdAndOferta_OfertaId(UUID alumnoId, UUID ofertaId);

    long countByOferta_OfertaId(UUID ofertaId);

    List<Inscripcion> findByAlumno_AlumnoId(UUID alumnoId);

    List<Inscripcion> findByOferta_OfertaId(UUID ofertaId);
}
