package com.showroom.showroom_api.service;

import com.showroom.showroom_api.dto.SaleCheckoutDTO;
import com.showroom.showroom_api.dto.SaleCheckoutResponseDTO;
import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.*;
import com.showroom.showroom_api.repository.CustomerRepository;
import com.showroom.showroom_api.repository.PaymentRepository;
import com.showroom.showroom_api.repository.SalesRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SalesService {

    private final SalesRepository salesRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;

    public List<Sales> getAllSales() {
        return salesRepository.findAll();
    }

    public Sales getSaleById(Long id) {
        return salesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
    }

    public List<Sales> getSalesByCustomer(Long customerId) {
        return salesRepository.findByCustomer_Id(customerId);
    }

    @Transactional
    public Sales createSale(Long vehicleId, Long customerId, Sales sale) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (salesRepository.existsByVehicle_Id(vehicleId)) {
            throw new BadRequestException("Vehicle is already sold.");
        }

        sale.setVehicle(vehicle);
        sale.setCustomer(customer);
        return salesRepository.save(sale);
    }

    /**
     * Transactional checkout: atomically creates a Sale + linked Payment.
     * If payment creation fails, the entire transaction rolls back.
     */
    @Transactional(rollbackFor = Exception.class)
    public SaleCheckoutResponseDTO createCompleteSale(SaleCheckoutDTO checkoutDto) {
        // 1. Validate vehicle exists
        Vehicle vehicle = vehicleRepository.findById(checkoutDto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found with id: " + checkoutDto.getVehicleId()));

        // 2. Check if vehicle is already sold
        if (salesRepository.existsByVehicle_Id(checkoutDto.getVehicleId())) {
            throw new BadRequestException("Vehicle with id " + checkoutDto.getVehicleId()
                    + " is already sold. Transaction aborted.");
        }

        // 3. Validate customer exists
        Customer customer = customerRepository.findById(checkoutDto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id: " + checkoutDto.getCustomerId()));

        // 4. Persist the Sale record
        Sales sale = Sales.builder()
                .target(checkoutDto.getTarget())
                .quantity(checkoutDto.getQuantity())
                .date(checkoutDto.getDate())
                .offer(checkoutDto.getOffer())
                .vehicle(vehicle)
                .customer(customer)
                .build();
        sale = salesRepository.save(sale);

        // 5. Parse and validate payment method
        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(checkoutDto.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Invalid payment method: " + checkoutDto.getPaymentMethod()
                    + ". Allowed values: CASH, LOAN, CHEQUE");
        }

        // 6. Create and link the Payment record (rolls back sale if this fails)
        Payment payment = Payment.builder()
                .method(paymentMethod)
                .amount(checkoutDto.getPaymentAmount())
                .paymentDate(checkoutDto.getPaymentDate())
                .customer(customer)
                .sale(sale)
                .build();
        payment = paymentRepository.save(payment);

        // 7. Build response
        String customerName = customer.getFirstName()
                + (customer.getLastName() != null ? " " + customer.getLastName() : "");

        return SaleCheckoutResponseDTO.builder()
                .saleId(sale.getId())
                .target(sale.getTarget())
                .quantity(sale.getQuantity())
                .date(sale.getDate())
                .offer(sale.getOffer())
                .vehicleId(vehicle.getId())
                .vehicleNumberPlate(vehicle.getNumberPlate())
                .customerId(customer.getId())
                .customerName(customerName)
                .paymentId(payment.getId())
                .paymentMethod(payment.getMethod().name())
                .paymentAmount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    @Transactional
    public void deleteSale(Long id) {
        Sales sale = salesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        salesRepository.delete(sale);
    }
}

