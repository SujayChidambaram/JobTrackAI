package JobTrack.AI.controller;

import JobTrack.AI.model.Interview;
import JobTrack.AI.service.InterviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    public List<Interview> getAllInterviews() {
        return interviewService.getAllInterviews();
    }

    @GetMapping("/{id}")
    public Interview getInterviewById(@PathVariable String id) {
        return interviewService.getInterviewById(id);
    }

    @GetMapping("/job/{jobApplicationId}")
    public List<Interview> getInterviewsByJobApplicationId(
            @PathVariable String jobApplicationId) {
        return interviewService.getInterviewsByJobApplicationId(jobApplicationId);
    }

    @PostMapping
    public Interview addInterview(@RequestBody Interview interview) {
        return interviewService.addInterview(interview);
    }

    @PutMapping("/{id}")
    public Interview updateInterview(
            @PathVariable String id,
            @RequestBody Interview interview) {
        return interviewService.updateInterview(id, interview);
    }

    @DeleteMapping("/{id}")
    public String deleteInterview(@PathVariable String id) {
        interviewService.deleteInterview(id);
        return "Interview deleted successfully";
    }
}