package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.TaxDTO;
import com.showroom.showroom_api.model.Tax;
import com.showroom.showroom_api.service.TaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tax")
@CrossOrigin
@RequiredArgsConstructor
public class TaxController {

    private final TaxService taxService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<TaxDTO> getTaxByVehicle(@PathVariable("vehicleId") Long vehicleId) {
        return ResponseEntity.ok(toDTO(taxService.getTaxByVehicleId(vehicleId)));
    }

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<TaxDTO> createTax(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestBody TaxDTO dto) {
        Tax tax = toEntity(dto);
        Tax saved = taxService.createTax(vehicleId, tax);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/vehicle/{vehicleId}")
    public ResponseEntity<TaxDTO> updateTax(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestBody TaxDTO dto) {
        Tax details = toEntity(dto);
        Tax updated = taxService.updateTax(vehicleId, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTax(@PathVariable("id") Long id) {
        taxService.deleteTax(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private TaxDTO toDTO(Tax t) {
        return TaxDTO.builder()
                .id(t.getId())
                .vehicleTax(t.getVehicleTax())
                .roadTax(t.getRoadTax())
                .paid(t.getPaid())
                .vehicleId(t.getVehicle() != null ? t.getVehicle().getId() : null)
                .build();
    }

    private Tax toEntity(TaxDTO dto) {
        return Tax.builder()
                .vehicleTax(dto.getVehicleTax())
                .roadTax(dto.getRoadTax())
                .paid(dto.getPaid())
                .build();
    }
}
