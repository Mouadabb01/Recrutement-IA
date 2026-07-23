package com.recrutement.repository;

import com.recrutement.model.Candidate;
import com.recrutement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUser(User user);
    Optional<Candidate> findByUserId(Long userId);
}
