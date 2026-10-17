package com.showroom.showroom_api.service;

import com.showroom.showroom_api.exception.BadRequestException;
import com.showroom.showroom_api.exception.ResourceNotFoundException;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.model.Vehicle;
import com.showroom.showroom_api.repository.ShowroomRepository;
import com.showroom.showroom_api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ShowroomRepository showroomRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    public List<Vehicle> getVehiclesByShowroom(Long showroomId) {
        return vehicleRepository.findByShowroom_Id(showroomId);
    }

    @Transactional
    public Vehicle createVehicle(Long showroomId, Vehicle vehicle) {
        Showroom showroom = showroomRepository.findById(showroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Showroom not found with id: " + showroomId));

        if (vehicleRepository.existsByNumberPlate(vehicle.getNumberPlate())) {
            throw new BadRequestException("Vehicle with number plate '" + vehicle.getNumberPlate() + "' already exists.");
        }

        vehicle.setShowroom(showroom);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle updateVehicle(Long id, Vehicle details) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        vehicle.setType(details.getType());
        vehicle.setBrand(details.getBrand());
        vehicle.setColour(details.getColour());
        vehicle.setNumberPlate(details.getNumberPlate());
        vehicle.setCost(details.getCost());

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(vehicle);
    }
}
