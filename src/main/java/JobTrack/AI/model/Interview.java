package JobTrack.AI.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    private String jobApplicationId;
    private String interviewDate;
    private String interviewTime;
    private String interviewRound;
    private String interviewStatus = "Scheduled";
    private String notes;

    public Interview() {
    }

    public Interview(String id, String jobApplicationId,
                     String interviewDate, String interviewTime,
                     String interviewRound, String notes) {
        this.id = id;
        this.jobApplicationId = jobApplicationId;
        this.interviewDate = interviewDate;
        this.interviewTime = interviewTime;
        this.interviewRound = interviewRound;
        this.notes = notes;
    }

    public Interview(String id, String jobApplicationId,
                     String interviewDate, String interviewTime,
                     String interviewRound, String interviewStatus,
                     String notes) {
        this.id = id;
        this.jobApplicationId = jobApplicationId;
        this.interviewDate = interviewDate;
        this.interviewTime = interviewTime;
        this.interviewRound = interviewRound;
        this.interviewStatus = interviewStatus;
        this.notes = notes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getJobApplicationId() {
        return jobApplicationId;
    }

    public void setJobApplicationId(String jobApplicationId) {
        this.jobApplicationId = jobApplicationId;
    }

    public String getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(String interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getInterviewTime() {
        return interviewTime;
    }

    public void setInterviewTime(String interviewTime) {
        this.interviewTime = interviewTime;
    }

    public String getInterviewRound() {
        return interviewRound;
    }

    public void setInterviewRound(String interviewRound) {
        this.interviewRound = interviewRound;
    }

    public String getInterviewStatus() {
        return interviewStatus;
    }

    public void setInterviewStatus(String interviewStatus) {
        this.interviewStatus = interviewStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}