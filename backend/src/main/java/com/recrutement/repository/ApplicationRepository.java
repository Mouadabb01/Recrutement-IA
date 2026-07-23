package com.recrutement.repository;

import com.recrutement.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobOfferId(Long jobOfferId);
    Optional<Application> findByCandidateIdAndJobOfferId(Long candidateId, Long jobOfferId);
}
