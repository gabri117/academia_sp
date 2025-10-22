package com.academia.academia.repository;

import com.academia.academia.entity.NivelAcademico;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NivelAcademicoRepository extends JpaRepository<NivelAcademico, UUID> {
}
