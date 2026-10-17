package com.showroom.showroom_api.controller;

import com.showroom.showroom_api.dto.ShowroomDTO;
import com.showroom.showroom_api.model.Showroom;
import com.showroom.showroom_api.service.ShowroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showrooms")
@CrossOrigin
@RequiredArgsConstructor
public class ShowroomController {

    private final ShowroomService showroomService;

    @GetMapping
    public ResponseEntity<List<ShowroomDTO>> getAllShowrooms() {
        List<ShowroomDTO> dtos = showroomService.getAllShowrooms().stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowroomDTO> getShowroomById(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(showroomService.getShowroomById(id)));
    }

    @PostMapping
    public ResponseEntity<ShowroomDTO> createShowroom(@RequestBody ShowroomDTO dto) {
        Showroom showroom = toEntity(dto);
        Showroom saved = showroomService.createShowroom(showroom);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShowroomDTO> updateShowroom(@PathVariable Long id, @RequestBody ShowroomDTO dto) {
        Showroom details = toEntity(dto);
        Showroom updated = showroomService.updateShowroom(id, details);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShowroom(@PathVariable Long id) {
        showroomService.deleteShowroom(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Mapper helpers ----

    private ShowroomDTO toDTO(Showroom s) {
        return ShowroomDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .address(s.getAddress())
                .manager(s.getManager())
                .salesExecutive(s.getSalesExecutive())
                .build();
    }

    private Showroom toEntity(ShowroomDTO dto) {
        return Showroom.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .manager(dto.getManager())
                .salesExecutive(dto.getSalesExecutive())
                .build();
    }
}
