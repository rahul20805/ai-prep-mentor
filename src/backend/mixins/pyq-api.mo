import PYQLib "../lib/pyq";
import PYQTypes "../types/pyq";
import Common "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

mixin (
  // Shared questions list (global — same for all users)
  questions : List.List<PYQTypes.Question>,
  // Per-user attempts: Map<Principal, List<AttemptRecord>>
  userAttempts : Map.Map<Principal, List.List<PYQTypes.AttemptRecord>>,
) {
  // For update calls: initialises an empty list in the map if not present
  func getOrCreateUserAttempts(caller : Principal) : List.List<PYQTypes.AttemptRecord> {
    switch (userAttempts.get(caller)) {
      case (?atts) atts;
      case null {
        let atts = List.empty<PYQTypes.AttemptRecord>();
        userAttempts.add(caller, atts);
        atts;
      };
    };
  };

  // For query calls: returns empty list without mutating
  func getUserAttemptsReadOnly(caller : Principal) : List.List<PYQTypes.AttemptRecord> {
    switch (userAttempts.get(caller)) {
      case (?atts) atts;
      case null List.empty<PYQTypes.AttemptRecord>();
    };
  };

  public shared ({ caller }) func listQuestions(subject : ?Common.Subject, difficulty : ?Common.Difficulty) : async [PYQTypes.Question] {
    // Seed questions globally on first call
    PYQLib.seed(questions);
    PYQLib.listQuestions(questions, subject, difficulty);
  };

  public shared ({ caller }) func submitAnswer(questionId : Nat, selectedOptionIndex : Nat) : async Bool {
    let atts = getOrCreateUserAttempts(caller);
    PYQLib.submitAnswer(questions, atts, questionId, selectedOptionIndex, Time.now());
  };

  public shared query ({ caller }) func getSubjectAccuracy() : async [PYQTypes.SubjectAccuracy] {
    let atts = getUserAttemptsReadOnly(caller);
    PYQLib.getSubjectAccuracy(atts, questions);
  };
};
