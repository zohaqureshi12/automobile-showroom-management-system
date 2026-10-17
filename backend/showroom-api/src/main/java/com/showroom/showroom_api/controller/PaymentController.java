package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.PaymentRequestDTO;
import com.showroom.showroom_api.dto.PaymentResponseDTO;
import com.showroom.showroom_api.model.Payment;
import com.showroom.showroom_api.model.PaymentMethod;
import com.showroom.showroom_api.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        List<PaymentResponseDTO> dtos = paymentService.getAllPayments().stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponseDTO(paymentService.getPaymentById(id)));
    }

    @GetMapping("/sale/{saleId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsBySale(@PathVariable Long saleId) {
        List<PaymentResponseDTO> dtos = paymentService.getPaymentsBySale(saleId).stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByCustomer(@PathVariable Long customerId) {
        List<PaymentResponseDTO> dtos = paymentService.getPaymentsByCustomer(customerId).stream()
                .map(this::toResponseDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(@RequestBody PaymentRequestDTO dto) {
        Payment payment = Payment.builder()
                .method(PaymentMethod.valueOf(dto.getMethod().toUpperCase()))
                .amount(dto.getAmount())
                .paymentDate(dto.getPaymentDate())
                .build();
        Payment saved = paymentService.createPayment(dto.getCustomerId(), dto.getSaleId(), payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private PaymentResponseDTO toResponseDTO(Payment p) {
        return PaymentResponseDTO.builder()
                .id(p.getId())
                .customerId(p.getCustomer().getId())
                .saleId(p.getSale().getId())
                .method(p.getMethod().name())
                .amount(p.getAmount())
                .paymentDate(p.getPaymentDate())
                .build();
    }
}
