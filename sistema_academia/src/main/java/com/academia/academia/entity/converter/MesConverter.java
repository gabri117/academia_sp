package com.academia.academia.entity.converter;

import com.academia.academia.entity.enums.Mes;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MesConverter implements AttributeConverter<Mes, String> {

    @Override
    public String convertToDatabaseColumn(Mes attribute) {
        return attribute != null ? attribute.getDatabaseValue() : null;
    }

    @Override
    public Mes convertToEntityAttribute(String dbData) {
        return dbData != null ? Mes.fromDatabaseValue(dbData) : null;
    }
}

