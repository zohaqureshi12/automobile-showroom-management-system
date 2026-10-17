package com.showroom.showroom_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowroomDTO {
    private Long id;
    private String name;
    private String address;
    private String manager;
    private String salesExecutive;
}
