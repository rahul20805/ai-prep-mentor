module {
  public type UserId = Principal;
  public type Timestamp = Int; // nanoseconds from Time.now()

  public type TaskStatus = { #pending; #completed; #skipped };
  public type Difficulty = { #easy; #medium; #hard };
  public type Subject = Text; // e.g. "Physics", "Chemistry", "Biology", "Math"

  public type LectureCard = {
    id : Text;
    title : Text;
    channelTitle : Text;
    description : Text;
    thumbnailUrl : Text;
    videoUrl : Text;
    duration : Text;
    viewCount : Text;
  };

  // Mutable config wrapper — passed by reference to mixins
  public type AppConfig = {
    var groqApiKey : Text;
    var youtubeApiKey : Text;
  };
};
