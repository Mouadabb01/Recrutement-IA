package com.recrutement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private final String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String role;
    
    // Auxiliary IDs to facilitate client-side navigation
    private Long candidateId;
    private Long companyId;
}
