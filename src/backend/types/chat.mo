import Common "common";

module {
  public type MessageRole = { #user; #mentor };

  public type ChatMessage = {
    id : Nat;
    role : MessageRole;
    content : Text;
    timestamp : Common.Timestamp;
  };
};
