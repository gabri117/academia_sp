package com.academia.academia.entity.converter;

import com.academia.academia.entity.enums.CargoEstado;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CargoEstadoConverter implements AttributeConverter<CargoEstado, String> {

    @Override
    public String convertToDatabaseColumn(CargoEstado attribute) {
        return attribute != null ? attribute.getDatabaseValue() : null;
    }

    @Override
    public CargoEstado convertToEntityAttribute(String dbData) {
        return dbData != null ? CargoEstado.fromDatabaseValue(dbData) : null;
    }
}

