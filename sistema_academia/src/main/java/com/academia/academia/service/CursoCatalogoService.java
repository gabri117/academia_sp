package com.academia.academia.service;

import com.academia.academia.dto.oferta.CursoCatalogoCreateDTO;
import com.academia.academia.dto.oferta.CursoCatalogoResponseDTO;
import com.academia.academia.dto.oferta.CursoCatalogoUpdateDTO;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CursoCatalogoService {

    Page<CursoCatalogoResponseDTO> listar(String nombre, Pageable pageable);

    CursoCatalogoResponseDTO obtener(UUID id);

    CursoCatalogoResponseDTO crear(CursoCatalogoCreateDTO dto);

    CursoCatalogoResponseDTO actualizar(UUID id, CursoCatalogoUpdateDTO dto);

    void eliminar(UUID id);
}
