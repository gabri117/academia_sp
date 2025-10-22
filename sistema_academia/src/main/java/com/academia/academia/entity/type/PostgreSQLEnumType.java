package com.academia.academia.entity.type;

import com.academia.academia.entity.enums.ReciboEstado;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Properties;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.type.EnumType;

@SuppressWarnings("deprecation")
public class PostgreSQLEnumType extends EnumType<ReciboEstado> {

    @Override
    public void setParameterValues(Properties parameters) {
        super.setParameterValues(parameters);
    }

    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    public void nullSafeSet(
            PreparedStatement st,
            ReciboEstado value,
            int index,
            SharedSessionContractImplementor session)
            throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            st.setObject(index, value.name(), Types.OTHER);
        }
    }
}
