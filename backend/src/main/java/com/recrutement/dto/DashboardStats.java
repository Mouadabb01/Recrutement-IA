package com.recrutement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private long totalCandidates;
    private long totalCompanies;
    private long totalJobOffers;
    private long totalApplications;
    private double averageCompatibilityScore;
    private Map<String, Long> applicationsStatusDistribution;
}
