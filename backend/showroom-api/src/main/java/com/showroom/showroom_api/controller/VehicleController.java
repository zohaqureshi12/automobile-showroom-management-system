package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.*;
import com.showroom.showroom_api.model.Features;
import com.showroom.showroom_api.model.Insurance;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.model.Tax;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.SalesRepository;
import com.showroom.showroom_api.service.FeaturesService;
import com.showroom.showroom_api.service.InsuranceService;
import com.showroom.showroom_api.service.TaxService;
import com.showroom.showroom_api.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final FeaturesService featuresService;
    private final TaxService taxService;
    private final InsuranceService insuranceService;
    private final SalesRepository salesRepository;

    @GetMapping
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        List<VehicleResponseDTO> dtos = vehicleService.getAllVehicles().stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(toResponseDTO(vehicleService.getVehicleById(id)));
    }

    @GetMapping("/showroom/{showroomId}")
    public ResponseEntity<List<VehicleResponseDTO>> getVehiclesByShowroom(@PathVariable("showroomId") Long showroomId) {
        List<VehicleResponseDTO> dtos = vehicleService.getVehiclesByShowroom(showroomId).stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<VehicleDetailResponseDTO> getVehicleFullDetail(@PathVariable("id") Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleFullDetails(id));
    }

    /**
     * GET /api/vehicles/catalog
     * Dynamic inventory search with optional filters: brand, type, minCost, maxCost, status (AVAILABLE/SOLD).
     * Returns enriched VehicleCatalogDTO with isSold flag derived from the sales table.
     */
    @GetMapping("/catalog")
    public ResponseEntity<List<VehicleCatalogDTO>> getVehicleCatalog(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minCost,
            @RequestParam(required = false) Double maxCost,
            @RequestParam(required = false) String status) {

        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        Stream<Vehicle> stream = vehicles.stream();

        // Apply brand filter (case-insensitive)
        if (brand != null && !brand.isBlank()) {
            stream = stream.filter(v -> v.getBrand().equalsIgnoreCase(brand));
        }

        // Apply type filter (case-insensitive)
        if (type != null && !type.isBlank()) {
            stream = stream.filter(v -> v.getType().equalsIgnoreCase(type));
        }

        // Apply minCost filter
        if (minCost != null) {
            stream = stream.filter(v -> v.getCost() >= minCost);
        }

        // Apply maxCost filter
        if (maxCost != null) {
            stream = stream.filter(v -> v.getCost() <= maxCost);
        }

        List<VehicleCatalogDTO> catalogList = stream.map(v -> {
            boolean isSold = salesRepository.existsByVehicle_Id(v.getId());

            FeaturesDTO featuresDTO = null;
            try {
                Features features = featuresService.getFeaturesByVehicleId(v.getId());
                featuresDTO = toFeaturesDTO(features);
            } catch (Exception ignored) {
            }

            TaxDTO taxDTO = null;
            try {
                Tax tax = taxService.getTaxByVehicleId(v.getId());
                taxDTO = toTaxDTO(tax);
            } catch (Exception ignored) {
            }

            InsuranceDTO insuranceDTO = null;
            try {
                Insurance insurance = insuranceService.getInsuranceByVehicleId(v.getId());
                insuranceDTO = toInsuranceDTO(insurance);
            } catch (Exception ignored) {
            }

            return VehicleCatalogDTO.builder()
                    .id(v.getId())
                    .type(v.getType())
                    .brand(v.getBrand())
                    .colour(v.getColour())
                    .numberPlate(v.getNumberPlate())
                    .cost(v.getCost())
                    .showroomId(v.getShowroom().getId())
                    .showroomName(v.getShowroom().getName())
                    .isSold(isSold)
                    .features(featuresDTO)
                    .tax(taxDTO)
                    .insurance(insuranceDTO)
                    .build();
        }).toList();

        // Apply status filter after mapping (needs isSold)
        if (status != null && !status.isBlank()) {
            if (status.equalsIgnoreCase("AVAILABLE")) {
                catalogList = catalogList.stream()
                        .filter(c -> !c.getIsSold())
                        .toList();
            } else if (status.equalsIgnoreCase("SOLD")) {
                catalogList = catalogList.stream()
                        .filter(VehicleCatalogDTO::getIsSold)
                        .toList();
            }
        }

        return ResponseEntity.ok(catalogList);
    }

    @PostMapping
    public ResponseEntity<VehicleResponseDTO> createVehicle(
            @RequestParam(required = false) Long showroomId,
            @RequestBody VehicleRequestDTO dto) {
        Long targetShowroomId = showroomId;
        if (targetShowroomId == null) {
            if (dto.getShowroomId() != null) {
                targetShowroomId = dto.getShowroomId();
            } else if (dto.getShowroom() != null && dto.getShowroom().getId() != null) {
                targetShowroomId = dto.getShowroom().getId();
            }
        }

        Vehicle vehicle = toEntity(dto);
        Vehicle saved = vehicleService.createVehicle(targetShowroomId, vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable("id") Long id,
            @RequestBody VehicleRequestDTO dto) {
        Vehicle details = toEntity(dto);
        Vehicle updated = vehicleService.updateVehicle(id, details);
        return ResponseEntity.ok(toResponseDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable("id") Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private VehicleResponseDTO toResponseDTO(Vehicle v) {
        return VehicleResponseDTO.builder()
                .id(v.getId())
                .type(v.getType())
                .brand(v.getBrand())
                .colour(v.getColour())
                .numberPlate(v.getNumberPlate())
                .cost(v.getCost())
                .showroomId(v.getShowroom() != null ? v.getShowroom().getId() : null)
                .showroomName(v.getShowroom() != null ? v.getShowroom().getName() : null)
                .build();
    }

    private Vehicle toEntity(VehicleRequestDTO dto) {
        Showroom s = dto.getShowroom();
        if (s == null && dto.getShowroomId() != null) {
            s = Showroom.builder().id(dto.getShowroomId()).build();
        }

        return Vehicle.builder()
                .type(dto.getType())
                .brand(dto.getBrand())
                .colour(dto.getColour())
                .numberPlate(dto.getNumberPlate())
                .cost(dto.getCost())
                .showroom(s)
                .version(dto.getVersion())
                .build();
    }

    private FeaturesDTO toFeaturesDTO(Features f) {
        return FeaturesDTO.builder()
                .id(f.getId())
                .engineCapacity(f.getEngineCapacity())
                .mileage(f.getMileage())
                .colour(f.getColour())
                .seatCapacity(f.getSeatCapacity())
                .fuelType(f.getFuelType())
                .pollutionControl(f.getPollutionControl())
                .safetyFeatures(f.getSafetyFeatures())
                .vehicleId(f.getVehicle().getId())
                .build();
    }

    private TaxDTO toTaxDTO(Tax t) {
        return TaxDTO.builder()
                .id(t.getId())
                .vehicleTax(t.getVehicleTax())
                .roadTax(t.getRoadTax())
                .paid(t.getPaid())
                .vehicleId(t.getVehicle().getId())
                .build();
    }

    private InsuranceDTO toInsuranceDTO(Insurance i) {
        return InsuranceDTO.builder()
                .id(i.getId())
                .expiryDate(i.getExpiryDate())
                .familyDetails(i.getFamilyDetails())
                .bankDetails(i.getBankDetails())
                .vehicleId(i.getVehicle().getId())
                .build();
    }
}

