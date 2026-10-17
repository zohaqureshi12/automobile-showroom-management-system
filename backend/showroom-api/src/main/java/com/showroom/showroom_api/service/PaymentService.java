package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Customer;
import com.showroom.showroom_api.model.Payment;
import com.showroom.showroom_api.model.Sales;
import com.showroom.showroom_api.repository.CustomerRepository;
import com.showroom.showroom_api.repository.PaymentRepository;
import com.showroom.showroom_api.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SalesRepository salesRepository;
    private final CustomerRepository customerRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    public List<Payment> getPaymentsBySale(Long saleId) {
        return paymentRepository.findBySale_Id(saleId);
    }

    public List<Payment> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByCustomer_Id(customerId);
    }

    @Transactional
    public Payment createPayment(Long customerId, Long saleId, Payment payment) {
        Sales sale = salesRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + saleId));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (!sale.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("Payment customer does not match the customer on the sale.");
        }

        payment.setSale(sale);
        payment.setCustomer(customer);
        return paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        paymentRepository.delete(payment);
    }
}
