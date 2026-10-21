package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Tax;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.TaxRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TaxService {

    private final TaxRepository taxRepository;
    private final VehicleRepository vehicleRepository;

    public Tax getTaxByVehicleId(Long vehicleId) {
        return taxRepository.findByVehicle_Id(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Tax not found for vehicle id: " + vehicleId));
    }

    @Transactional
    public Tax createTax(Long vehicleId, Tax tax) {
        if (taxRepository.existsByVehicle_Id(vehicleId)) {
            throw new RuntimeException("1:1 constraint violation: Tax already exists for this vehicle");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        tax.setVehicle(vehicle);
        return taxRepository.save(tax);
    }

    @Transactional
    public Tax updateTax(Long vehicleId, Tax details) {
        Tax tax = taxRepository.findByVehicle_Id(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Tax not found for vehicle id: " + vehicleId));

        tax.setVehicleTax(details.getVehicleTax());
        tax.setRoadTax(details.getRoadTax());
        tax.setPaid(details.getPaid());

        return taxRepository.save(tax);
    }

    @Transactional
    public void deleteTax(Long id) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));
        taxRepository.delete(tax);
    }
}
