package com.academia.academia.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // QA-HANDLERS-START
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> Map.of(
                        "field",
                        fieldError.getField(),
                        "message",
                        Objects.toString(fieldError.getDefaultMessage(), "")))
                .collect(Collectors.toList());

        String message = errors.isEmpty()
                ? "Solicitud invalida"
                : errors.stream()
                        .map(error -> String.format(
                                "{\"field\":\"%s\",\"message\":\"%s\"}",
                                error.get("field"),
                                error.get("message")))
                        .collect(Collectors.joining(", ", "[", "]"));

        return buildResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {
        final java.util.List<java.util.Map<String, String>> errors =
                ex.getConstraintViolations()
                        .stream()
                        .map((jakarta.validation.ConstraintViolation<?> v) -> {
                            java.util.Map<String, String> e = new java.util.LinkedHashMap<>();
                            e.put("path", v.getPropertyPath() != null ? v.getPropertyPath().toString() : "");
                            e.put("message", v.getMessage());
                            return e;
                        })
                        .collect(java.util.stream.Collectors.toList());

        String message = errors.isEmpty()
                ? "Solicitud invalida"
                : errors.stream()
                        .map(error -> String.format(
                                "{\"path\":\"%s\",\"message\":\"%s\"}",
                                error.get("path"),
                                Objects.toString(error.get("message"), "")))
                        .collect(Collectors.joining(", ", "[", "]"));

        return buildResponse(HttpStatus.BAD_REQUEST, message, request);
    }
    // QA-HANDLERS-END

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> handleConversionIssues(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request);
    }

    private ResponseEntity<ApiError> buildResponse(HttpStatus status, String message, HttpServletRequest request) {
        String safeMessage = (message == null || message.isBlank()) ? status.getReasonPhrase() : message;
        String path = request != null ? request.getRequestURI() : null;
        ApiError body = new ApiError(
            OffsetDateTime.now(),
            status.value(),
            status.getReasonPhrase(),
            safeMessage,
            path
        );
        return ResponseEntity.status(status).body(body);
    }
}
