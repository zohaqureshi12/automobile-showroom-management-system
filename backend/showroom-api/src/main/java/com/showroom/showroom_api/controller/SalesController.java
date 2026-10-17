package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.SaleCheckoutDTO;
import com.showroom.showroom_api.dto.SaleCheckoutResponseDTO;
import com.showroom.showroom_api.dto.SaleRequestDTO;
import com.showroom.showroom_api.dto.SaleResponseDTO;
import com.showroom.showroom_api.model.Sales;
import com.showroom.showroom_api.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @GetMapping
    public ResponseEntity<List<SaleResponseDTO>> getAllSales() {
        List<SaleResponseDTO> dtos = salesService.getAllSales().stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponseDTO(salesService.getSaleById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SaleResponseDTO>> getSalesByCustomer(@PathVariable Long customerId) {
        List<SaleResponseDTO> dtos = salesService.getSalesByCustomer(customerId).stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<SaleResponseDTO> createSale(@RequestBody SaleRequestDTO dto) {
        Sales sale = Sales.builder()
                .target(dto.getTarget())
                .quantity(dto.getQuantity())
                .date(dto.getDate())
                .offer(dto.getOffer())
                .build();
        Sales saved = salesService.createSale(dto.getVehicleId(), dto.getCustomerId(), sale);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
    }

    /**
     * POST /api/sales/checkout
     * Transactional checkout: atomically creates Sale + Payment.
     * Rolls back entirely if any step fails.
     */
    @PostMapping("/checkout")
    public ResponseEntity<SaleCheckoutResponseDTO> checkout(@RequestBody SaleCheckoutDTO dto) {
        SaleCheckoutResponseDTO response = salesService.createCompleteSale(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        salesService.deleteSale(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private SaleResponseDTO toResponseDTO(Sales s) {
        String customerName = s.getCustomer().getFirstName()
                + (s.getCustomer().getLastName() != null ? " " + s.getCustomer().getLastName() : "");
        return SaleResponseDTO.builder()
                .id(s.getId())
                .target(s.getTarget())
                .quantity(s.getQuantity())
                .date(s.getDate())
                .offer(s.getOffer())
                .vehicleId(s.getVehicle().getId())
                .vehicleNumberPlate(s.getVehicle().getNumberPlate())
                .customerId(s.getCustomer().getId())
                .customerName(customerName)
                .build();
    }
}

