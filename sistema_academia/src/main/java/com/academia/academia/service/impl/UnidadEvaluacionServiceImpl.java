package com.academia.academia.service.impl;

import com.academia.academia.dto.evaluacion.UnidadEvaluacionResponseDTO;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.UnidadEvaluacion;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.UnidadEvaluacionMapper;
import com.academia.academia.repository.OfertaCursoRepository;
import com.academia.academia.repository.UnidadEvaluacionRepository;
import com.academia.academia.service.UnidadEvaluacionService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UnidadEvaluacionServiceImpl implements UnidadEvaluacionService {

    private final UnidadEvaluacionRepository unidadEvaluacionRepository;
    private final OfertaCursoRepository ofertaCursoRepository;
    private final UnidadEvaluacionMapper unidadEvaluacionMapper;

    public UnidadEvaluacionServiceImpl(
            UnidadEvaluacionRepository unidadEvaluacionRepository,
            OfertaCursoRepository ofertaCursoRepository,
            UnidadEvaluacionMapper unidadEvaluacionMapper) {
        this.unidadEvaluacionRepository = unidadEvaluacionRepository;
        this.ofertaCursoRepository = ofertaCursoRepository;
        this.unidadEvaluacionMapper = unidadEvaluacionMapper;
    }

    @Override
    @Transactional
    public UnidadEvaluacionResponseDTO crearUnidad(UUID ofertaId, String nombre) {
        OfertaCurso ofertaCurso = ofertaCursoRepository
                .findById(ofertaId)
                .orElseThrow(() -> new NotFoundException("Oferta de curso no encontrada"));

        UnidadEvaluacion unidadEvaluacion = new UnidadEvaluacion();
        unidadEvaluacion.setOferta(ofertaCurso);
        unidadEvaluacion.setNombre(nombre);

        UnidadEvaluacion guardada = unidadEvaluacionRepository.save(unidadEvaluacion);
        return unidadEvaluacionMapper.toResponse(guardada);
    }

    @Override
    public List<UnidadEvaluacionResponseDTO> listarPorOferta(UUID ofertaId) {
        return unidadEvaluacionRepository
                .findByOferta_OfertaId(ofertaId)
                .stream()
                .map(unidadEvaluacionMapper::toResponse)
                .collect(Collectors.toList());
    }
}
