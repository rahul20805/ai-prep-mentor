import Common "common";

module {
  public type Question = {
    id : Nat;
    year : Nat;
    subject : Common.Subject;
    topic : Text;
    difficulty : Common.Difficulty;
    questionText : Text;
    options : [Text]; // 4 options A-D
    correctOptionIndex : Nat; // 0-3
  };

  public type AttemptRecord = {
    questionId : Nat;
    selectedOptionIndex : Nat;
    isCorrect : Bool;
    attemptedAt : Common.Timestamp;
  };

  public type SubjectAccuracy = {
    subject : Common.Subject;
    totalAttempts : Nat;
    correctAttempts : Nat;
    accuracyPercent : Nat;
  };
};
