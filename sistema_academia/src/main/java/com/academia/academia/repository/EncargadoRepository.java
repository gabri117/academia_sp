package com.academia.academia.repository;

import com.academia.academia.entity.Encargado;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EncargadoRepository extends JpaRepository<Encargado, UUID> {
}
