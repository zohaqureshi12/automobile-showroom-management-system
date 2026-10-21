package com.showroom.showroom_api;

import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Insurance;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.InsuranceRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import com.showroom.showroom_api.service.InsuranceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InsuranceServiceTest {

    @Mock
    private InsuranceRepository insuranceRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private InsuranceService insuranceService;

    private Vehicle sampleVehicle;
    private Insurance sampleInsurance;

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

        sampleInsurance = Insurance.builder()
                .id(20L)
                .expiryDate(LocalDate.of(2027, 6, 15))
                .familyDetails("Rohan Verma, Spouse: Neha Verma")
                .bankDetails("SBI A/C **** 4321")
                .vehicle(sampleVehicle)
                .build();
    }

    @Test
    void testGetInsuranceByVehicleId_Success() {
        when(insuranceRepository.findByVehicle_Id(1L)).thenReturn(Optional.of(sampleInsurance));

        Insurance result = insuranceService.getInsuranceByVehicleId(1L);

        assertNotNull(result);
        assertEquals(LocalDate.of(2027, 6, 15), result.getExpiryDate());
        assertEquals("Rohan Verma, Spouse: Neha Verma", result.getFamilyDetails());
        assertEquals("SBI A/C **** 4321", result.getBankDetails());
        verify(insuranceRepository, times(1)).findByVehicle_Id(1L);
    }

    @Test
    void testGetInsuranceByVehicleId_NotFound() {
        when(insuranceRepository.findByVehicle_Id(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> insuranceService.getInsuranceByVehicleId(99L));
    }

    @Test
    void testCreateInsurance_Success() {
        when(insuranceRepository.existsByVehicle_Id(1L)).thenReturn(false);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(sampleVehicle));
        when(insuranceRepository.save(any(Insurance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Insurance newInsurance = Insurance.builder()
                .expiryDate(LocalDate.of(2028, 1, 1))
                .familyDetails("Family Details")
                .bankDetails("HDFC A/C **** 9999")
                .build();

        Insurance saved = insuranceService.createInsurance(1L, newInsurance);

        assertNotNull(saved);
        assertEquals(sampleVehicle, saved.getVehicle());
        assertEquals(LocalDate.of(2028, 1, 1), saved.getExpiryDate());
        verify(insuranceRepository, times(1)).save(newInsurance);
    }

    @Test
    void testCreateInsurance_ViolationThrowsRuntimeException() {
        when(insuranceRepository.existsByVehicle_Id(1L)).thenReturn(true);

        Insurance newInsurance = Insurance.builder()
                .expiryDate(LocalDate.of(2028, 1, 1))
                .familyDetails("Family Details")
                .bankDetails("HDFC A/C **** 9999")
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> insuranceService.createInsurance(1L, newInsurance));
        assertEquals("1:1 constraint violation: Insurance already exists for this vehicle", ex.getMessage());
        verify(insuranceRepository, never()).save(any());
    }

    @Test
    void testUpdateInsurance_Success() {
        when(insuranceRepository.findByVehicle_Id(1L)).thenReturn(Optional.of(sampleInsurance));
        when(insuranceRepository.save(any(Insurance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Insurance updateDetails = Insurance.builder()
                .expiryDate(LocalDate.of(2029, 1, 1))
                .familyDetails("Updated Family")
                .bankDetails("ICICI A/C **** 1234")
                .build();

        Insurance updated = insuranceService.updateInsurance(1L, updateDetails);

        assertNotNull(updated);
        assertEquals(LocalDate.of(2029, 1, 1), updated.getExpiryDate());
        assertEquals("Updated Family", updated.getFamilyDetails());
        assertEquals("ICICI A/C **** 1234", updated.getBankDetails());
    }

    @Test
    void testDeleteInsurance_Success() {
        when(insuranceRepository.findById(20L)).thenReturn(Optional.of(sampleInsurance));

        insuranceService.deleteInsurance(20L);

        verify(insuranceRepository, times(1)).delete(sampleInsurance);
    }
}
