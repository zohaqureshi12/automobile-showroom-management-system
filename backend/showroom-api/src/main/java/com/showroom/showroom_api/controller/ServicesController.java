package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.ServicesRequestDTO;
import com.showroom.showroom_api.dto.ServicesResponseDTO;
import com.showroom.showroom_api.model.Services;
import com.showroom.showroom_api.service.ServicesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin
@RequiredArgsConstructor
public class ServicesController {

    private final ServicesService servicesService;

    @GetMapping
    public ResponseEntity<List<ServicesResponseDTO>> getAllServices() {
        List<ServicesResponseDTO> dtos = servicesService.getAllServices().stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicesResponseDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponseDTO(servicesService.getServiceById(id)));
    }

    @GetMapping("/showroom/{showroomId}")
    public ResponseEntity<List<ServicesResponseDTO>> getServicesByShowroom(@PathVariable Long showroomId) {
        List<ServicesResponseDTO> dtos = servicesService.getServicesByShowroom(showroomId).stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ServicesResponseDTO>> getServicesByCustomer(@PathVariable Long customerId) {
        List<ServicesResponseDTO> dtos = servicesService.getServicesByCustomer(customerId).stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<ServicesResponseDTO> createService(@RequestBody ServicesRequestDTO dto) {
        Services service = Services.builder()
                .issue(dto.getIssue())
                .price(dto.getPrice())
                .entryDate(dto.getEntryDate())
                .deliveryDate(dto.getDeliveryDate())
                .build();
        Services saved = servicesService.createService(dto.getShowroomId(), dto.getCustomerId(), service);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicesResponseDTO> updateService(
            @PathVariable Long id,
            @RequestBody ServicesRequestDTO dto) {
        Services details = Services.builder()
                .issue(dto.getIssue())
                .price(dto.getPrice())
                .entryDate(dto.getEntryDate())
                .deliveryDate(dto.getDeliveryDate())
                .build();
        Services updated = servicesService.updateService(id, details);
        return ResponseEntity.ok(toResponseDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        servicesService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private ServicesResponseDTO toResponseDTO(Services s) {
        String customerName = s.getCustomer().getFirstName()
                + (s.getCustomer().getLastName() != null ? " " + s.getCustomer().getLastName() : "");
        return ServicesResponseDTO.builder()
                .id(s.getId())
                .showroomId(s.getShowroom().getId())
                .customerId(s.getCustomer().getId())
                .customerName(customerName)
                .issue(s.getIssue())
                .price(s.getPrice())
                .entryDate(s.getEntryDate())
                .deliveryDate(s.getDeliveryDate())
                .build();
    }
}
