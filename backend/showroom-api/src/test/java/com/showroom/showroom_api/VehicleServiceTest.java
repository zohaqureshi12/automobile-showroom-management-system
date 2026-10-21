package com.showroom.showroom_api;

import com.showroom.showroom_api.dto.VehicleDetailResponseDTO;
import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.model.Insurance;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.model.Tax;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.*;
import com.showroom.showroom_api.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ShowroomRepository showroomRepository;

    @Mock
    private FeaturesRepository featuresRepository;

    @Mock
    private TaxRepository taxRepository;

    @Mock
    private InsuranceRepository insuranceRepository;

    @Mock
    private SalesRepository salesRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle sampleVehicle;
    private Showroom sampleShowroom;

    @BeforeEach
    void setUp() {
        sampleShowroom = Showroom.builder()
                .id(1L)
                .name("Indore Central Hub")
                .address("AB Road")
                .manager("Rajesh")
                .salesExecutive("Amit")
                .build();

        sampleVehicle = Vehicle.builder()
                .id(100L)
                .type("Sedan")
                .brand("Honda City")
                .colour("White")
                .numberPlate("MP09ZZ9999")
                .cost(1500000.0)
                .showroom(sampleShowroom)
                .build();
    }

    @Test
    void testGetVehicleFullDetails_Success() {
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(sampleVehicle));
        when(taxRepository.findByVehicle_Id(100L)).thenReturn(Optional.of(
                Tax.builder().id(1L).vehicleTax(40000.0).roadTax(20000.0).paid(true).vehicle(sampleVehicle).build()
        ));
        when(insuranceRepository.findByVehicle_Id(100L)).thenReturn(Optional.of(
                Insurance.builder().id(2L).expiryDate(LocalDate.of(2027, 1, 1)).familyDetails("Family").bankDetails("Bank").vehicle(sampleVehicle).build()
        ));
        when(featuresRepository.findByVehicle_Id(100L)).thenReturn(Optional.empty());

        VehicleDetailResponseDTO dto = vehicleService.getVehicleFullDetails(100L);

        assertNotNull(dto);
        assertEquals(100L, dto.getId());
        assertEquals("Honda City", dto.getBrand());
        assertEquals("Indore Central Hub", dto.getShowroomName());
        assertNotNull(dto.getTax());
        assertEquals(40000.0, dto.getTax().getVehicleTax());
        assertNotNull(dto.getInsurance());
        assertEquals("Family", dto.getInsurance().getFamilyDetails());
    }

    @Test
    void testDeleteVehicle_SuccessCleansUpDependentRecords() {
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(sampleVehicle));
        when(salesRepository.existsByVehicle_Id(100L)).thenReturn(false);

        Tax tax = Tax.builder().id(1L).build();
        Insurance insurance = Insurance.builder().id(2L).build();
        when(taxRepository.findByVehicle_Id(100L)).thenReturn(Optional.of(tax));
        when(insuranceRepository.findByVehicle_Id(100L)).thenReturn(Optional.of(insurance));
        when(featuresRepository.findByVehicle_Id(100L)).thenReturn(Optional.empty());

        vehicleService.deleteVehicle(100L);

        verify(taxRepository, times(1)).delete(tax);
        verify(insuranceRepository, times(1)).delete(insurance);
        verify(vehicleRepository, times(1)).delete(sampleVehicle);
    }

    @Test
    void testDeleteVehicle_PreventedWhenLinkedToSale() {
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(sampleVehicle));
        when(salesRepository.existsByVehicle_Id(100L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> vehicleService.deleteVehicle(100L));
        assertTrue(ex.getMessage().contains("Cannot delete vehicle"));

        verify(vehicleRepository, never()).delete(any());
        verify(taxRepository, never()).delete(any());
    }

    @Test
    void testCreateVehicle_SuccessWithShowroomLookupAndVersionInit() {
        when(showroomRepository.findById(1L)).thenReturn(Optional.of(sampleShowroom));
        when(vehicleRepository.existsByNumberPlate("MP 09 ZY 8765")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Vehicle v = Vehicle.builder()
                .type("Hatchback")
                .brand("Kia Sonet")
                .colour("Black")
                .numberPlate("  MP 09 ZY 8765  ")
                .cost(3000000.0)
                .build();

        Vehicle created = vehicleService.createVehicle(1L, v);

        assertNotNull(created);
        assertEquals(sampleShowroom, created.getShowroom());
        assertEquals("MP 09 ZY 8765", created.getNumberPlate());
        assertEquals(0, created.getVersion());
        verify(vehicleRepository, times(1)).save(v);
    }

    @Test
    void testCreateVehicle_UsingVehicleWithShowroomIdOnly() {
        when(showroomRepository.findById(1L)).thenReturn(Optional.of(sampleShowroom));
        when(vehicleRepository.existsByNumberPlate("MP09AB1111")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Vehicle v = Vehicle.builder()
                .type("SUV")
                .brand("Creta")
                .colour("White")
                .numberPlate("MP09AB1111")
                .cost(2000000.0)
                .showroom(Showroom.builder().id(1L).build())
                .build();

        Vehicle created = vehicleService.createVehicle(v);

        assertNotNull(created);
        assertEquals(sampleShowroom, created.getShowroom());
        assertEquals(0, created.getVersion());
    }
}
