package com.showroom.showroom_api.repository;

import com.showroom.showroom_api.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByCustomer_Id(Long customerId);

    List<Payment> findBySale_Id(Long saleId);
}
