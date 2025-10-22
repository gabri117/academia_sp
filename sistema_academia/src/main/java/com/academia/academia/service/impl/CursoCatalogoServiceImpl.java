package com.academia.academia.service.impl;

import com.academia.academia.dto.oferta.CursoCatalogoCreateDTO;
import com.academia.academia.dto.oferta.CursoCatalogoResponseDTO;
import com.academia.academia.dto.oferta.CursoCatalogoUpdateDTO;
import com.academia.academia.entity.CursoCatalogo;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.CursoMapper;
import com.academia.academia.repository.CursoCatalogoRepository;
import com.academia.academia.service.CursoCatalogoService;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class CursoCatalogoServiceImpl implements CursoCatalogoService {

    private final CursoCatalogoRepository cursoCatalogoRepository;
    private final CursoMapper cursoMapper;

    public CursoCatalogoServiceImpl(
            CursoCatalogoRepository cursoCatalogoRepository,
            CursoMapper cursoMapper) {
        this.cursoCatalogoRepository = cursoCatalogoRepository;
        this.cursoMapper = cursoMapper;
    }

    @Override
    public Page<CursoCatalogoResponseDTO> listar(String nombre, Pageable pageable) {
        if (StringUtils.hasText(nombre)) {
            return cursoCatalogoRepository
                    .findByNombreContainingIgnoreCase(nombre, pageable)
                    .map(cursoMapper::toResponse);
        }
        return cursoCatalogoRepository.findAll(pageable).map(cursoMapper::toResponse);
    }

    @Override
    public CursoCatalogoResponseDTO obtener(UUID id) {
        CursoCatalogo cursoCatalogo = buscarPorId(id);
        return cursoMapper.toResponse(cursoCatalogo);
    }

    @Override
    @Transactional
    public CursoCatalogoResponseDTO crear(CursoCatalogoCreateDTO dto) {
        CursoCatalogo cursoCatalogo = new CursoCatalogo();
        cursoCatalogo.setNombre(dto.getNombre());
        cursoCatalogo.setNivelCurso(dto.getNivelCurso());
        cursoCatalogo.setDuracion(dto.getDuracion());

        CursoCatalogo guardado = cursoCatalogoRepository.save(cursoCatalogo);
        return cursoMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public CursoCatalogoResponseDTO actualizar(UUID id, CursoCatalogoUpdateDTO dto) {
        CursoCatalogo cursoCatalogo = buscarPorId(id);

        cursoCatalogo.setNombre(dto.getNombre());
        cursoCatalogo.setNivelCurso(dto.getNivelCurso());
        cursoCatalogo.setDuracion(dto.getDuracion());

        CursoCatalogo actualizado = cursoCatalogoRepository.save(cursoCatalogo);
        return cursoMapper.toResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        CursoCatalogo cursoCatalogo = buscarPorId(id);
        cursoCatalogoRepository.delete(cursoCatalogo);
    }

    private CursoCatalogo buscarPorId(UUID id) {
        return cursoCatalogoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Curso de catalogo no encontrado"));
    }
}
