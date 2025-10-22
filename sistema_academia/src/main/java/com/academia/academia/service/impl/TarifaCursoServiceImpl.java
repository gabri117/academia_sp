package com.academia.academia.service.impl;

import com.academia.academia.dto.pagos.TarifaCursoCreateDTO;
import com.academia.academia.dto.pagos.TarifaCursoResponseDTO;
import com.academia.academia.dto.pagos.TarifaCursoUpdateDTO;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.TarifaCurso;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.pagos.TarifaCursoMapper;
import com.academia.academia.repository.OfertaCursoRepository;
import com.academia.academia.repository.TarifaCursoRepository;
import com.academia.academia.service.TarifaCursoService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TarifaCursoServiceImpl implements TarifaCursoService {

    private final TarifaCursoRepository tarifaCursoRepository;
    private final OfertaCursoRepository ofertaCursoRepository;
    private final TarifaCursoMapper tarifaCursoMapper;

    public TarifaCursoServiceImpl(
            TarifaCursoRepository tarifaCursoRepository,
            OfertaCursoRepository ofertaCursoRepository,
            TarifaCursoMapper tarifaCursoMapper) {
        this.tarifaCursoRepository = tarifaCursoRepository;
        this.ofertaCursoRepository = ofertaCursoRepository;
        this.tarifaCursoMapper = tarifaCursoMapper;
    }

    @Override
    @Transactional
    public TarifaCursoResponseDTO crear(TarifaCursoCreateDTO dto) {
        OfertaCurso ofertaCurso = obtenerOferta(dto.getOfertaId());

        TarifaCurso tarifaCurso = new TarifaCurso();
        tarifaCurso.setOferta(ofertaCurso);
        tarifaCurso.setMontoInscripcion(dto.getMontoInscripcion());
        tarifaCurso.setMontoMensualidad(dto.getMontoMensualidad());

        TarifaCurso guardada = tarifaCursoRepository.save(tarifaCurso);
        return tarifaCursoMapper.toResponse(guardada);
    }

    @Override
    @Transactional
    public TarifaCursoResponseDTO actualizar(UUID id, TarifaCursoUpdateDTO dto) {
        TarifaCurso tarifaCurso = obtenerTarifa(id);
        OfertaCurso ofertaCurso = obtenerOferta(dto.getOfertaId());

        tarifaCurso.setOferta(ofertaCurso);
        tarifaCurso.setMontoInscripcion(dto.getMontoInscripcion());
        tarifaCurso.setMontoMensualidad(dto.getMontoMensualidad());

        TarifaCurso actualizada = tarifaCursoRepository.save(tarifaCurso);
        return tarifaCursoMapper.toResponse(actualizada);
    }

    @Override
    public TarifaCursoResponseDTO obtener(UUID id) {
        TarifaCurso tarifaCurso = obtenerTarifa(id);
        return tarifaCursoMapper.toResponse(tarifaCurso);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        TarifaCurso tarifaCurso = obtenerTarifa(id);
        tarifaCursoRepository.delete(tarifaCurso);
    }

    @Override
    public List<TarifaCursoResponseDTO> listarPorOferta(UUID ofertaId) {
        return tarifaCursoRepository
                .findByOferta_OfertaId(ofertaId)
                .stream()
                .map(tarifaCursoMapper::toResponse)
                .collect(Collectors.toList());
    }

    private TarifaCurso obtenerTarifa(UUID id) {
        return tarifaCursoRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Tarifa de curso no encontrada"));
    }

    private OfertaCurso obtenerOferta(UUID ofertaId) {
        return ofertaCursoRepository
                .findById(ofertaId)
                .orElseThrow(() -> new NotFoundException("Oferta de curso no encontrada"));
    }
}
