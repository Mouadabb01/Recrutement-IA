package com.recrutement.service;

import com.recrutement.dto.DashboardStats;
import com.recrutement.model.Application;
import com.recrutement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatsService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public DashboardStats getPlatformStats() {
        long totalCandidates = candidateRepository.count();
        long totalCompanies = companyRepository.count();
        long totalJobOffers = jobOfferRepository.count();
        
        List<Application> allApplications = applicationRepository.findAll();
        long totalApplications = allApplications.size();

        double avgScore = 0.0;
        if (totalApplications > 0) {
            avgScore = allApplications.stream()
                    .filter(app -> app.getCompatibilityScore() != null)
                    .mapToDouble(Application::getCompatibilityScore)
                    .average()
                    .orElse(0.0);
        }

        Map<String, Long> statusDist = allApplications.stream()
                .collect(Collectors.groupingBy(
                        Application::getStatus,
                        Collectors.counting()
                ));

        return DashboardStats.builder()
                .totalCandidates(totalCandidates)
                .totalCompanies(totalCompanies)
                .totalJobOffers(totalJobOffers)
                .totalApplications(totalApplications)
                .averageCompatibilityScore(avgScore)
                .applicationsStatusDistribution(statusDist)
                .build();
    }
}
