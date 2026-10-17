package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Insurance;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.InsuranceRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class InsuranceService {

    private final InsuranceRepository insuranceRepository;
    private final VehicleRepository vehicleRepository;

    public Insurance getInsuranceByVehicleId(Long vehicleId) {
        return insuranceRepository.findByVehicle_Id(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found for vehicle id: " + vehicleId));
    }

    @Transactional
    public Insurance createInsurance(Long vehicleId, Insurance insurance) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (insuranceRepository.existsByVehicle_Id(vehicleId)) {
            throw new BadRequestException("Insurance record already exists for vehicle id: " + vehicleId);
        }

        insurance.setVehicle(vehicle);
        return insuranceRepository.save(insurance);
    }

    @Transactional
    public Insurance updateInsurance(Long vehicleId, Insurance details) {
        Insurance insurance = insuranceRepository.findByVehicle_Id(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found for vehicle id: " + vehicleId));

        insurance.setExpiryDate(details.getExpiryDate());
        insurance.setFamilyDetails(details.getFamilyDetails());
        insurance.setBankDetails(details.getBankDetails());

        return insuranceRepository.save(insurance);
    }

    @Transactional
    public void deleteInsurance(Long id) {
        Insurance insurance = insuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found with id: " + id));
        insuranceRepository.delete(insurance);
    }
}
