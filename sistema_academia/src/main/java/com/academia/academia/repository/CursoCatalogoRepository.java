package com.academia.academia.repository;

import com.academia.academia.entity.CursoCatalogo;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoCatalogoRepository extends JpaRepository<CursoCatalogo, UUID> {

    Page<CursoCatalogo> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}
