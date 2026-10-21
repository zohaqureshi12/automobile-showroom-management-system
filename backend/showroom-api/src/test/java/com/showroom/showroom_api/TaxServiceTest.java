package com.showroom.showroom_api;

import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Tax;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.TaxRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import com.showroom.showroom_api.service.TaxService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxServiceTest {

    @Mock
    private TaxRepository taxRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private TaxService taxService;

    private Vehicle sampleVehicle;
    private Tax sampleTax;

    @BeforeEach
    void setUp() {
        sampleVehicle = Vehicle.builder()
                .id(1L)
                .brand("Honda City")
                .type("Sedan")
                .colour("White")
                .numberPlate("MP09AB1234")
                .cost(1500000.0)
                .build();

        sampleTax = Tax.builder()
                .id(10L)
                .vehicleTax(45000.0)
                .roadTax(22500.0)
                .paid(true)
                .vehicle(sampleVehicle)
                .build();
    }

    @Test
    void testGetTaxByVehicleId_Success() {
        when(taxRepository.findByVehicle_Id(1L)).thenReturn(Optional.of(sampleTax));

        Tax result = taxService.getTaxByVehicleId(1L);

        assertNotNull(result);
        assertEquals(45000.0, result.getVehicleTax());
        assertEquals(22500.0, result.getRoadTax());
        assertTrue(result.getPaid());
        verify(taxRepository, times(1)).findByVehicle_Id(1L);
    }

    @Test
    void testGetTaxByVehicleId_NotFound() {
        when(taxRepository.findByVehicle_Id(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taxService.getTaxByVehicleId(99L));
    }

    @Test
    void testCreateTax_Success() {
        when(taxRepository.existsByVehicle_Id(1L)).thenReturn(false);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        when(taxRepository.save(any(Tax.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tax newTax = Tax.builder()
                .vehicleTax(30000.0)
                .roadTax(15000.0)
                .paid(false)
                .build();

        Tax saved = taxService.createTax(1L, newTax);

        assertNotNull(saved);
        assertEquals(sampleVehicle, saved.getVehicle());
        assertEquals(30000.0, saved.getVehicleTax());
        verify(taxRepository, times(1)).save(newTax);
    }

    @Test
    void testCreateTax_ViolationThrowsRuntimeException() {
        when(taxRepository.existsByVehicle_Id(1L)).thenReturn(true);

        Tax newTax = Tax.builder()
                .vehicleTax(30000.0)
                .roadTax(15000.0)
                .paid(false)
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> taxService.createTax(1L, newTax));
        assertEquals("1:1 constraint violation: Tax already exists for this vehicle", ex.getMessage());
        verify(taxRepository, never()).save(any());
    }

    @Test
    void testUpdateTax_Success() {
        when(taxRepository.findByVehicle_Id(1L)).thenReturn(Optional.of(sampleTax));
        when(taxRepository.save(any(Tax.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tax updateDetails = Tax.builder()
                .vehicleTax(50000.0)
                .roadTax(25000.0)
                .paid(true)
                .build();

        Tax updated = taxService.updateTax(1L, updateDetails);

        assertNotNull(updated);
        assertEquals(50000.0, updated.getVehicleTax());
        assertEquals(25000.0, updated.getRoadTax());
        assertTrue(updated.getPaid());
    }

    @Test
    void testDeleteTax_Success() {
        when(taxRepository.findById(10L)).thenReturn(Optional.of(sampleTax));

        taxService.deleteTax(10L);

        verify(taxRepository, times(1)).delete(sampleTax);
    }
}
