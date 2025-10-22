package com.academia.academia.entity.converter;

import com.academia.academia.entity.enums.OfertaStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class OfertaStatusConverter implements AttributeConverter<OfertaStatus, String> {

    @Override
    public String convertToDatabaseColumn(OfertaStatus attribute) {
        return attribute != null ? attribute.getDatabaseValue() : null;
    }

    @Override
    public OfertaStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? OfertaStatus.fromDatabaseValue(dbData) : null;
    }
}
