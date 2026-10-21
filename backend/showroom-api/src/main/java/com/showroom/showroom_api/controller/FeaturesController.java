package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.FeaturesDTO;
import com.showroom.showroom_api.model.Features;
import com.showroom.showroom_api.service.FeaturesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/features")
@CrossOrigin
@RequiredArgsConstructor
public class FeaturesController {

    private final FeaturesService featuresService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<FeaturesDTO> getFeaturesByVehicle(@PathVariable("vehicleId") Long vehicleId) {
        return ResponseEntity.ok(toDTO(featuresService.getFeaturesByVehicleId(vehicleId)));
    }

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<FeaturesDTO> createFeatures(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestBody FeaturesDTO dto) {
        Features features = toEntity(dto);
        Features saved = featuresService.createFeatures(vehicleId, features);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/vehicle/{vehicleId}")
    public ResponseEntity<FeaturesDTO> updateFeatures(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestBody FeaturesDTO dto) {
        Features details = toEntity(dto);
        Features updated = featuresService.updateFeatures(vehicleId, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeatures(@PathVariable("id") Long id) {
        featuresService.deleteFeatures(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private FeaturesDTO toDTO(Features f) {
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

    private Features toEntity(FeaturesDTO dto) {
        return Features.builder()
                .engineCapacity(dto.getEngineCapacity())
                .mileage(dto.getMileage())
                .colour(dto.getColour())
                .seatCapacity(dto.getSeatCapacity())
                .fuelType(dto.getFuelType())
                .pollutionControl(dto.getPollutionControl())
                .safetyFeatures(dto.getSafetyFeatures())
                .build();
    }
}
