package com.academia.academia.repository;

import com.academia.academia.entity.OfertaCurso;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OfertaCursoRepository extends JpaRepository<OfertaCurso, UUID> {

    @Query(
            "SELECT oc FROM OfertaCurso oc "
                    + "WHERE (:gradoId IS NULL OR oc.gradoAcademico.gradoId = :gradoId) "
                    + "AND (:institutoId IS NULL OR oc.establecimiento.institutoId = :institutoId) "
                    + "AND (:cursoId IS NULL OR oc.cursoCatalogo.cursoId = :cursoId)")
    Page<OfertaCurso> findAllByFilters(
            @Param("gradoId") UUID gradoId,
            @Param("institutoId") UUID institutoId,
            @Param("cursoId") UUID cursoId,
            Pageable pageable);
}
