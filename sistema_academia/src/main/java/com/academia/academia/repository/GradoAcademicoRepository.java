package com.academia.academia.repository;

import com.academia.academia.entity.GradoAcademico;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradoAcademicoRepository extends JpaRepository<GradoAcademico, UUID> {
}
