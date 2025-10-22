package com.academia.academia.config;

import java.util.Arrays;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String originsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        String[] allowedOrigins = (originsEnv != null && !originsEnv.isBlank())
                ? Arrays.stream(originsEnv.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isEmpty())
                        .toArray(String[]::new)
                : new String[] {"*"};

        registry
                .addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
        // En producción, reemplace el comodín por la lista exacta de dominios autorizados.
    }
}
