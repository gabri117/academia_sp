package com.academia.academia.service.impl;

import com.academia.academia.dto.pagos.CargoCreateDTO;
import com.academia.academia.dto.pagos.CargoResponseDTO;
import com.academia.academia.dto.pagos.CargoUpdateDTO;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.TarifaCurso;
import com.academia.academia.entity.enums.CargoEstado;
import com.academia.academia.entity.enums.Mes;
import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.pagos.CargoMapper;
import com.academia.academia.repository.CargoRepository;
import com.academia.academia.repository.DetalleReciboRepository;
import com.academia.academia.repository.TarifaCursoRepository;
import com.academia.academia.service.CargoService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CargoServiceImpl implements CargoService {

    private final CargoRepository cargoRepository;
    private final TarifaCursoRepository tarifaCursoRepository;
    private final DetalleReciboRepository detalleReciboRepository;
    private final CargoMapper cargoMapper;

    public CargoServiceImpl(
            CargoRepository cargoRepository,
            TarifaCursoRepository tarifaCursoRepository,
            DetalleReciboRepository detalleReciboRepository,
            CargoMapper cargoMapper) {
        this.cargoRepository = cargoRepository;
        this.tarifaCursoRepository = tarifaCursoRepository;
        this.detalleReciboRepository = detalleReciboRepository;
        this.cargoMapper = cargoMapper;
    }

    @Override
    @Transactional
    public CargoResponseDTO crear(CargoCreateDTO dto) {
        TarifaCurso tarifaCurso = obtenerTarifa(dto.getTarifaId());

        Mes periodoMes = dto.getPeriodoMes();
        String concepto = dto.getConcepto();
        String periodoMesDbValue = periodoMes != null ? periodoMes.getDatabaseValue() : null;
        if (cargoRepository.existsByTarifa_TarifaIdAndPeriodoMesAndConcepto(
                tarifaCurso.getTarifaId(), periodoMesDbValue, concepto)) {
            throw new ConflictException("Ya existe un cargo para el mismo periodo y concepto");
        }

        Cargo cargo = new Cargo();
        cargo.setTarifa(tarifaCurso);
        cargo.setPeriodoMes(periodoMes);
        cargo.setConcepto(concepto);
        cargo.setMonto(dto.getMonto());
        cargo.setEstado(dto.getEstado() != null ? dto.getEstado() : CargoEstado.PENDIENTE);

        Cargo guardado = cargoRepository.save(cargo);
        return cargoMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public CargoResponseDTO actualizar(UUID id, CargoUpdateDTO dto) {
        Cargo cargo = obtenerCargo(id);

        cargo.setPeriodoMes(dto.getPeriodoMes());
        cargo.setConcepto(dto.getConcepto());
        cargo.setMonto(dto.getMonto());
        cargo.setEstado(dto.getEstado());

        Cargo actualizado = cargoRepository.save(cargo);
        return cargoMapper.toResponse(actualizado);
    }

    @Override
    public CargoResponseDTO obtener(UUID id) {
        Cargo cargo = obtenerCargo(id);
        return cargoMapper.toResponse(cargo);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Cargo cargo = obtenerCargo(id);
        cargoRepository.delete(cargo);
    }

    @Override
    public List<CargoResponseDTO> listarPorTarifa(UUID tarifaId) {
        return cargoRepository
                .findByTarifa_TarifaId(tarifaId)
                .stream()
                .map(cargoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CargoResponseDTO recalcularEstado(UUID cargoId) {
        Cargo cargo = obtenerCargo(cargoId);
        BigDecimal montoTotal = cargo.getMonto() != null ? cargo.getMonto() : BigDecimal.ZERO;

        BigDecimal montoAplicado = detalleReciboRepository
                .findByCargo_CargoId(cargoId)
                .stream()
                .map(DetalleRecibo::getMontoAplicado)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (montoAplicado.compareTo(montoTotal) >= 0) {
            if (cargo.getEstado() != CargoEstado.CANCELADO) {
                cargo.setEstado(CargoEstado.CANCELADO);
                cargoRepository.save(cargo);
            }
        } else if (cargo.getEstado() == CargoEstado.CANCELADO) {
            cargo.setEstado(CargoEstado.PENDIENTE);
            cargoRepository.save(cargo);
        }

        return cargoMapper.toResponse(cargo);
    }

    private TarifaCurso obtenerTarifa(UUID tarifaId) {
        return tarifaCursoRepository
                .findById(tarifaId)
                .orElseThrow(() -> new NotFoundException("Tarifa de curso no encontrada"));
    }

    private Cargo obtenerCargo(UUID cargoId) {
        return cargoRepository
                .findById(cargoId)
                .orElseThrow(() -> new NotFoundException("Cargo no encontrado"));
    }
}
