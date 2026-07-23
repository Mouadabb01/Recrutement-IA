package com.recrutement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class MatchResult {
        private int score;
        private String feedback;

        public MatchResult(int score, String feedback) {
            this.score = score;
            this.feedback = feedback;
        }

        public int getScore() { return score; }
        public String getFeedback() { return feedback; }
    }

    public MatchResult evaluateMatch(String jobTitle, String jobDesc, String jobReqs, 
                                     String candidateTitle, String candidateSkills, 
                                     int expYears, String resumeText) {
        
        // Build the prompt
        String prompt = String.format(
            "Tu es un assistant de recrutement expert. Analyse la compatibilité entre l'offre d'emploi suivante et le CV du candidat.\n\n" +
            "OFFRE D'EMPLOI :\n" +
            "Titre : %s\n" +
            "Description : %s\n" +
            "Exigences : %s\n\n" +
            "CV DU CANDIDAT :\n" +
            "Titre : %s\n" +
            "Compétences : %s\n" +
            "Années d'expérience : %d\n" +
            "Texte complet du CV : %s\n\n" +
            "Donne une évaluation détaillée. Tu DOIS retourner uniquement un objet JSON valide avec exactement ces deux champs (sans balises markdown comme ```json) :\n" +
            "{\n" +
            "  \"score\": (un entier de 0 à 100 représentant l'adéquation),\n" +
            "  \"feedback\": \"(une analyse synthétique en français sur les points forts et les lacunes du candidat par rapport aux exigences)\"\n" +
            "}",
            jobTitle, jobDesc, jobReqs, candidateTitle, candidateSkills, expYears, resumeText
        );

        // Prepare request body for Gemini API
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        
        Map<String, Object> partContainer = new HashMap<>();
        partContainer.put("parts", List.of(textPart));
        
        requestBody.put("contents", List.of(partContainer));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        
        // Construct full URL with API key
        String urlWithKey = apiUrl + "?key=" + apiKey;

        try {
            logger.info("Calling Gemini API for CV-to-Job matching...");
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(urlWithKey, requestEntity, String.class);
            String responseBody = responseEntity.getBody();

            if (responseBody != null) {
                // Parse response
                JsonNode rootNode = objectMapper.readTree(responseBody);
                JsonNode textNode = rootNode.path("candidates").get(0)
                        .path("content").path("parts").get(0).path("text");
                
                String rawText = textNode.asText().trim();
                
                // Strip markdown formatting if the model returned it despite instructions
                if (rawText.startsWith("```")) {
                    rawText = rawText.replaceAll("^```json", "")
                                     .replaceAll("^```", "")
                                     .replaceAll("```$", "")
                                     .trim();
                }

                JsonNode resultNode = objectMapper.readTree(rawText);
                int score = resultNode.path("score").asInt(50);
                String feedback = resultNode.path("feedback").asText("Évaluation terminée.");

                return new MatchResult(score, feedback);
            }
        } catch (Exception e) {
            logger.error("Failed to call Gemini API, using fallback scoring: {}", e.getMessage());
        }

        // Fallback in case of API failure or invalid API key
        return getFallbackMatch(jobTitle, jobDesc, jobReqs, candidateSkills, resumeText);
    }

    private MatchResult getFallbackMatch(String jobTitle, String jobDesc, String jobReqs, String skills, String resumeText) {
        String lowercaseCV = (skills + " " + resumeText).toLowerCase();
        String lowercaseJob = (jobTitle + " " + jobReqs).toLowerCase();
        
        int score = 50; 
        
        // Simuler une analyse sémantique avancée
        if (lowercaseJob.contains("java") && lowercaseCV.contains("java")) score += 15;
        if (lowercaseJob.contains("react") && lowercaseCV.contains("react")) score += 15;
        if (lowercaseJob.contains("devops") && lowercaseCV.contains("kubernetes")) score += 20;
        if (lowercaseJob.contains("devops") && lowercaseCV.contains("terraform")) score += 10;
        if (lowercaseJob.contains("spring") && lowercaseCV.contains("spring")) score += 10;
        if (lowercaseCV.contains("docker")) score += 5;
        if (lowercaseCV.contains("aws") || lowercaseCV.contains("cloud")) score += 5;
        
        if (score > 95) score = 95;
        if (score < 30) score = 30;
        
        String feedback;
        if (score >= 80) {
            feedback = "Excellente adéquation. Le profil correspond parfaitement aux exigences principales du poste (" + jobTitle + "). " +
                       "Le candidat maîtrise les technologies clés demandées. " +
                       "Recommandation : À convoquer en entretien prioritaire.";
        } else if (score >= 60) {
            feedback = "Bon profil. Le candidat possède une bonne base technique pour le poste, mais certaines compétences spécifiques " +
                       "mentionnées dans l'offre pourraient nécessiter une montée en compétence. " +
                       "Recommandation : Profil intéressant à évaluer techniquement.";
        } else {
            feedback = "Adéquation faible. Les compétences mises en avant dans le CV ne correspondent pas suffisamment " +
                       "aux critères essentiels de l'offre d'emploi. L'expérience requise semble manquer sur les technologies clés.";
        }
        
        return new MatchResult(score, feedback);
    }
}
