package com.academia.academia.repository;

import com.academia.academia.entity.Establecimiento;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstablecimientoRepository extends JpaRepository<Establecimiento, UUID> {
}
