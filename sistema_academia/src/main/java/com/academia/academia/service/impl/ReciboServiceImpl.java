package com.academia.academia.service.impl;

import com.academia.academia.dto.pagos.DetalleReciboCreateDTO;
import com.academia.academia.dto.pagos.DetalleReciboResponseDTO;
import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.dto.pagos.ReciboCreateDTO;
import com.academia.academia.dto.pagos.ReciboOfertaFlat;
import com.academia.academia.dto.pagos.ReciboResponseDTO;
import com.academia.academia.dto.pagos.ReciboUpdateDTO;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.enums.ReciboEstado;
import com.academia.academia.entity.id.DetalleReciboId;
import com.academia.academia.exception.ConflictException;
import com.academia.academia.exception.NotFoundException;
import com.academia.academia.mapper.pagos.DetalleReciboMapper;
import com.academia.academia.mapper.pagos.ReciboConOfertasMapper;
import com.academia.academia.mapper.pagos.ReciboMapper;
import com.academia.academia.repository.AlumnoRepository;
import com.academia.academia.repository.CargoRepository;
import com.academia.academia.repository.DetalleReciboRepository;
import com.academia.academia.repository.ReciboRepository;
import com.academia.academia.service.CargoService;
import com.academia.academia.service.ReciboService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReciboServiceImpl implements ReciboService {

    private final ReciboRepository reciboRepository;
    private final AlumnoRepository alumnoRepository;
    private final CargoRepository cargoRepository;
    private final DetalleReciboRepository detalleReciboRepository;
    private final ReciboMapper reciboMapper;
    private final DetalleReciboMapper detalleReciboMapper;
    private final ReciboConOfertasMapper reciboConOfertasMapper;
    private final CargoService cargoService;

    public ReciboServiceImpl(
            ReciboRepository reciboRepository,
            AlumnoRepository alumnoRepository,
            CargoRepository cargoRepository,
            DetalleReciboRepository detalleReciboRepository,
            ReciboMapper reciboMapper,
            DetalleReciboMapper detalleReciboMapper,
            ReciboConOfertasMapper reciboConOfertasMapper,
            CargoService cargoService) {
        this.reciboRepository = reciboRepository;
        this.alumnoRepository = alumnoRepository;
        this.cargoRepository = cargoRepository;
        this.detalleReciboRepository = detalleReciboRepository;
        this.reciboMapper = reciboMapper;
        this.detalleReciboMapper = detalleReciboMapper;
        this.reciboConOfertasMapper = reciboConOfertasMapper;
        this.cargoService = cargoService;
    }

    @Override
    @Transactional
    public ReciboResponseDTO registrar(ReciboCreateDTO dto) {
        Alumno alumno = alumnoRepository
                .findById(dto.getAlumnoId())
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));

        BigDecimal total = dto.getTotal();
        if (total != null && total.compareTo(BigDecimal.ZERO) < 0) {
            throw new ConflictException("El total del recibo no puede ser negativo");
        }

        Recibo recibo = new Recibo();
        recibo.setAlumno(alumno);
        recibo.setCorrelativoRecibo(dto.getCorrelativoRecibo());
        if (dto.getFecha() != null) {
            recibo.setFecha(dto.getFecha());
        }
        if (total != null) {
            recibo.setTotal(total);
        }
        if (dto.getEstado() != null) {
            recibo.setEstado(dto.getEstado());
        } else {
            recibo.setEstado(ReciboEstado.EMITIDO);
        }

        Recibo guardado = reciboRepository.save(recibo);
        return reciboMapper.toResponse(guardado);
    }

    @Override
    @Transactional
    public DetalleReciboResponseDTO registrarDetalle(DetalleReciboCreateDTO dto) {
        if (dto.getMontoAplicado().compareTo(BigDecimal.ZERO) < 0) {
            throw new ConflictException("El monto aplicado no puede ser negativo");
        }

        Recibo recibo = reciboRepository
                .findById(dto.getReciboId())
                .orElseThrow(() -> new NotFoundException("Recibo no encontrado"));

        Cargo cargo = cargoRepository
                .findById(dto.getCargoId())
                .orElseThrow(() -> new NotFoundException("Cargo no encontrado"));

        DetalleReciboId id = new DetalleReciboId(dto.getReciboId(), dto.getCargoId());
        if (detalleReciboRepository.existsById(id)) {
            throw new ConflictException("El detalle de recibo ya existe para el cargo indicado");
        }

        BigDecimal montoAplicado = dto.getMontoAplicado();

        DetalleRecibo detalleRecibo = new DetalleRecibo();
        detalleRecibo.setId(id);
        detalleRecibo.setRecibo(recibo);
        detalleRecibo.setCargo(cargo);
        detalleRecibo.setMontoAplicado(montoAplicado);

        DetalleRecibo guardado = detalleReciboRepository.save(detalleRecibo);

        BigDecimal totalActual = recibo.getTotal() != null ? recibo.getTotal() : BigDecimal.ZERO;
        recibo.setTotal(totalActual.add(montoAplicado));
        reciboRepository.save(recibo);

        cargoService.recalcularEstado(cargo.getCargoId());

        return detalleReciboMapper.toResponse(guardado);
    }

    @Override
    public List<ReciboResponseDTO> listarPorAlumno(UUID alumnoId) {
        return reciboRepository
                .findByAlumno_AlumnoId(alumnoId)
                .stream()
                .map(reciboMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DetalleReciboResponseDTO> listarDetalles(UUID reciboId) {
        return detalleReciboRepository
                .findByRecibo_ReciboId(reciboId)
                .stream()
                .map(detalleReciboMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReciboConOfertasDTO> buscarRecibosConOfertas(
            UUID alumnoId,
            ReciboEstado estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta) {
        List<ReciboOfertaFlat> rows =
                reciboRepository.findRecibosConOfertas(alumnoId, estado, fechaDesde, fechaHasta);
        if (rows.isEmpty()) {
            return List.of();
        }
        return reciboConOfertasMapper.fromFlatRows(rows);
    }

    @Override
    @Transactional(readOnly = true)
    public ReciboResponseDTO obtenerPorId(UUID id) {
        Recibo recibo = reciboRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Recibo no encontrado"));
        return reciboMapper.toResponse(recibo);
    }

    @Override
    @Transactional
    public ReciboResponseDTO actualizar(UUID id, ReciboUpdateDTO dto) {

        Recibo recibo = reciboRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Recibo no encontrado"));

        if (dto.getTotal() != null && dto.getTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new ConflictException("El total del recibo no puede ser negativo");
        }

        if (dto.getFecha() != null) {
            recibo.setFecha(dto.getFecha());
        }
        if (dto.getTotal() != null) {
            recibo.setTotal(dto.getTotal());
        }
        if (dto.getEstado() != null) {
            recibo.setEstado(dto.getEstado());
        }

        Recibo actualizado = reciboRepository.save(recibo);
        return reciboMapper.toResponse(actualizado);
    }
}



