package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.InsuranceDTO;
import com.showroom.showroom_api.model.Insurance;
import com.showroom.showroom_api.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insurance")
@CrossOrigin
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceService insuranceService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<InsuranceDTO> getInsuranceByVehicle(@PathVariable("vehicleId") Long vehicleId) {
        return ResponseEntity.ok(toDTO(insuranceService.getInsuranceByVehicleId(vehicleId)));
    }

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<InsuranceDTO> createInsurance(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestBody InsuranceDTO dto) {
        Insurance insurance = toEntity(dto);
        Insurance saved = insuranceService.createInsurance(vehicleId, insurance);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/vehicle/{vehicleId}")
    public ResponseEntity<InsuranceDTO> updateInsurance(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestBody InsuranceDTO dto) {
        Insurance details = toEntity(dto);
        Insurance updated = insuranceService.updateInsurance(vehicleId, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurance(@PathVariable("id") Long id) {
        insuranceService.deleteInsurance(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private InsuranceDTO toDTO(Insurance i) {
        return InsuranceDTO.builder()
                .id(i.getId())
                .expiryDate(i.getExpiryDate())
                .familyDetails(i.getFamilyDetails())
                .bankDetails(i.getBankDetails())
                .vehicleId(i.getVehicle() != null ? i.getVehicle().getId() : null)
                .build();
    }

    private Insurance toEntity(InsuranceDTO dto) {
        return Insurance.builder()
                .expiryDate(dto.getExpiryDate())
                .familyDetails(dto.getFamilyDetails())
                .bankDetails(dto.getBankDetails())
                .build();
    }
}
