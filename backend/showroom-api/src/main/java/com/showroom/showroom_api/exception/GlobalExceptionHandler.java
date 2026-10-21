package com.showroom.showroom_api.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler to ensure all endpoints return clean JSON
 * error responses without stack traces or circular references.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler({
            DataIntegrityViolationException.class,
            ConstraintViolationException.class
    })
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(Exception ex) {
        Throwable rootCause = null;
        if (ex instanceof DataIntegrityViolationException dive) {
            rootCause = dive.getRootCause();
        } else if (ex.getCause() != null) {
            rootCause = ex.getCause();
        }
        if (rootCause == null) {
            rootCause = ex;
        }

        String rootMsg = rootCause.getMessage() != null ? rootCause.getMessage() : "";
        String exMsg = ex.getMessage() != null ? ex.getMessage() : "";
        String combined = (exMsg + " " + rootMsg).toLowerCase();

        if (combined.contains("foreign key") || combined.contains("cannot delete") || combined.contains("a foreign key constraint fails")) {
            if (combined.contains("delete")) {
                return buildResponse(HttpStatus.CONFLICT,
                        "Cannot delete this record because it has active linked records (Insurance, Tax, Sales, or Service history).");
            } else {
                return buildResponse(HttpStatus.BAD_REQUEST,
                        "Invalid reference: The selected Showroom does not exist or has an invalid ID.");
            }
        }

        if (combined.contains("duplicate entry")) {
            return buildResponse(HttpStatus.CONFLICT,
                    "Duplicate entry: A record with this number plate already exists.");
        }

        String errorDetail = !rootMsg.isBlank() ? rootMsg : exMsg;
        return buildResponse(HttpStatus.BAD_REQUEST, errorDetail);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
