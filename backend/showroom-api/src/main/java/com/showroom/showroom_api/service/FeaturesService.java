package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Features;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.FeaturesRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class FeaturesService {

    private final FeaturesRepository featuresRepository;
    private final VehicleRepository vehicleRepository;

    public Features getFeaturesByVehicleId(Long vehicleId) {
        return featuresRepository.findByVehicle_Id(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Features not found for vehicle id: " + vehicleId));
    }

    @Transactional
    public Features createFeatures(Long vehicleId, Features features) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (featuresRepository.existsByVehicle_Id(vehicleId)) {
            throw new BadRequestException("Features already exist for vehicle id: " + vehicleId);
        }

        features.setVehicle(vehicle);
        return featuresRepository.save(features);
    }

    @Transactional
    public Features updateFeatures(Long vehicleId, Features details) {
        Features features = featuresRepository.findByVehicle_Id(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Features not found for vehicle id: " + vehicleId));

        features.setEngineCapacity(details.getEngineCapacity());
        features.setMileage(details.getMileage());
        features.setColour(details.getColour());
        features.setSeatCapacity(details.getSeatCapacity());
        features.setFuelType(details.getFuelType());
        features.setPollutionControl(details.getPollutionControl());
        features.setSafetyFeatures(details.getSafetyFeatures());

        return featuresRepository.save(features);
    }

    @Transactional
    public void deleteFeatures(Long id) {
        Features features = featuresRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Features not found with id: " + id));
        featuresRepository.delete(features);
    }
}
