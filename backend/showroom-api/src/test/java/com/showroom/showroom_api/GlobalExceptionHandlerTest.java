package com.showroom.showroom_api;

import com.showroom.showroom_api.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void testDataIntegrityViolation_ForeignKeyDeleteReturns409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement",
                new RuntimeException("Cannot delete or update a parent row: a foreign key constraint fails (`showroom_db`.`sales`, CONSTRAINT `FK_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`))")
        );

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Cannot delete this record because it has active linked records (Insurance, Tax, Sales, or Service history).", response.getBody().get("message"));
    }

    @Test
    void testDataIntegrityViolation_ForeignKeyInsertReturns400() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement [insert into vehicles ...]",
                new RuntimeException("Cannot add or update a child row: a foreign key constraint fails (`showroom_db`.`vehicles`, CONSTRAINT `FK_showroom` FOREIGN KEY (`showroom_id`) REFERENCES `showrooms` (`id`))")
        );

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid reference: The selected Showroom does not exist or has an invalid ID.", response.getBody().get("message"));
    }

    @Test
    void testDataIntegrityViolation_DuplicateEntryReturns409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement",
                new RuntimeException("Duplicate entry 'MP 09 ZY 8765' for key 'vehicles.number_plate'")
        );

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Duplicate entry: A record with this number plate already exists.", response.getBody().get("message"));
    }

    @Test
    void testDataIntegrityViolation_ColumnIssueReturns400WithExactCause() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement",
                new RuntimeException("Column 'colour' cannot be null")
        );

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Column 'colour' cannot be null", response.getBody().get("message"));
    }
}
