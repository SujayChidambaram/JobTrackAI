package JobTrack.AI.service;

import JobTrack.AI.model.Interview;
import JobTrack.AI.repository.InterviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;

    public InterviewService(InterviewRepository interviewRepository) {
        this.interviewRepository = interviewRepository;
    }

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    public Interview addInterview(Interview interview) {
        if (interview.getInterviewStatus() == null ||
                interview.getInterviewStatus().isBlank()) {
            interview.setInterviewStatus("Scheduled");
        }

        return interviewRepository.save(interview);
    }

    public Interview getInterviewById(String id) {
        return interviewRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found: " + id));
    }

    public List<Interview> getInterviewsByJobApplicationId(
            String jobApplicationId) {
        return interviewRepository.findByJobApplicationId(jobApplicationId);
    }

    public Interview updateInterview(
            String id, Interview updatedInterview) {

        Interview interview = getInterviewById(id);

        interview.setJobApplicationId(updatedInterview.getJobApplicationId());
        interview.setInterviewDate(updatedInterview.getInterviewDate());
        interview.setInterviewTime(updatedInterview.getInterviewTime());
        interview.setInterviewRound(updatedInterview.getInterviewRound());
        interview.setInterviewStatus(
                updatedInterview.getInterviewStatus() == null ||
                        updatedInterview.getInterviewStatus().isBlank()
                        ? "Scheduled"
                        : updatedInterview.getInterviewStatus()
        );
        interview.setNotes(updatedInterview.getNotes());

        return interviewRepository.save(interview);
    }

    public void deleteInterview(String id) {
        Interview interview = getInterviewById(id);
        interviewRepository.delete(interview);
    }
}