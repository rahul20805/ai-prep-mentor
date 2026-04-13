import type {
  AnalyticsSummary,
  ChatMessage,
  DashboardStats,
  Question,
  SubjectAccuracy,
  TodayTask,
  WeeklyTimetable,
  backendInterface,
} from "../backend";
import { Difficulty, MessageRole, Priority, TaskStatus } from "../backend";

export const mockBackend: backendInterface = {
  getDashboardStats: async (): Promise<DashboardStats> => ({
    totalStudyHoursThisWeek: BigInt(18),
    todayCompletionPercent: BigInt(65),
    weakSubjects: ["Organic Chemistry", "Waves & Optics"],
    overallAccuracyPercent: BigInt(72),
  }),

  getTodayTasks: async (): Promise<TodayTask[]> => [
    {
      id: BigInt(1),
      status: TaskStatus.completed,
      topic: "Electrochemistry",
      subject: "Chemistry",
      estimatedMinutes: BigInt(45),
    },
    {
      id: BigInt(2),
      status: TaskStatus.completed,
      topic: "Differential Equations",
      subject: "Mathematics",
      estimatedMinutes: BigInt(60),
    },
    {
      id: BigInt(3),
      status: TaskStatus.pending,
      topic: "Optics & Wave Theory",
      subject: "Physics",
      estimatedMinutes: BigInt(45),
    },
    {
      id: BigInt(4),
      status: TaskStatus.pending,
      topic: "Organic Chemistry - Reactions",
      subject: "Chemistry",
      estimatedMinutes: BigInt(50),
    },
    {
      id: BigInt(5),
      status: TaskStatus.skipped,
      topic: "Trigonometry Revision",
      subject: "Mathematics",
      estimatedMinutes: BigInt(30),
    },
  ],

  getWeeklyTimetable: async (): Promise<WeeklyTimetable> => ({
    weekStartTimestamp: BigInt(Date.now()),
    tasks: [
      {
        id: BigInt(1),
        status: TaskStatus.completed,
        topic: "Electrochemistry",
        subject: "Chemistry",
        priority: Priority.high,
        dayIndex: BigInt(0),
        estimatedMinutes: BigInt(45),
      },
      {
        id: BigInt(2),
        status: TaskStatus.completed,
        topic: "Differential Equations",
        subject: "Mathematics",
        priority: Priority.medium,
        dayIndex: BigInt(0),
        estimatedMinutes: BigInt(60),
      },
      {
        id: BigInt(3),
        status: TaskStatus.pending,
        topic: "Optics & Wave Theory",
        subject: "Physics",
        priority: Priority.high,
        dayIndex: BigInt(1),
        estimatedMinutes: BigInt(45),
      },
      {
        id: BigInt(4),
        status: TaskStatus.pending,
        topic: "Organic Chemistry - Reactions",
        subject: "Chemistry",
        priority: Priority.medium,
        dayIndex: BigInt(1),
        estimatedMinutes: BigInt(50),
      },
      {
        id: BigInt(5),
        status: TaskStatus.skipped,
        topic: "Trigonometry Revision",
        subject: "Mathematics",
        priority: Priority.low,
        dayIndex: BigInt(2),
        rescheduledFromDay: BigInt(1),
        estimatedMinutes: BigInt(30),
      },
      {
        id: BigInt(6),
        status: TaskStatus.pending,
        topic: "Thermodynamics",
        subject: "Physics",
        priority: Priority.high,
        dayIndex: BigInt(3),
        estimatedMinutes: BigInt(55),
      },
      {
        id: BigInt(7),
        status: TaskStatus.pending,
        topic: "Biomolecules",
        subject: "Biology",
        priority: Priority.medium,
        dayIndex: BigInt(4),
        estimatedMinutes: BigInt(40),
      },
      {
        id: BigInt(8),
        status: TaskStatus.pending,
        topic: "Calculus - Integration",
        subject: "Mathematics",
        priority: Priority.high,
        dayIndex: BigInt(5),
        estimatedMinutes: BigInt(60),
      },
      {
        id: BigInt(9),
        status: TaskStatus.pending,
        topic: "Genetics & Evolution",
        subject: "Biology",
        priority: Priority.medium,
        dayIndex: BigInt(6),
        estimatedMinutes: BigInt(45),
      },
    ],
  }),

  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => ({
    totalStudyHoursThisWeek: BigInt(18),
    dailyAccuracyLast7Days: [
      { date: "Mon", totalAttempts: BigInt(20), accuracyPercent: BigInt(60) },
      { date: "Tue", totalAttempts: BigInt(25), accuracyPercent: BigInt(68) },
      { date: "Wed", totalAttempts: BigInt(18), accuracyPercent: BigInt(72) },
      { date: "Thu", totalAttempts: BigInt(30), accuracyPercent: BigInt(75) },
      { date: "Fri", totalAttempts: BigInt(22), accuracyPercent: BigInt(70) },
      { date: "Sat", totalAttempts: BigInt(28), accuracyPercent: BigInt(78) },
      { date: "Sun", totalAttempts: BigInt(15), accuracyPercent: BigInt(80) },
    ],
    accuracyPerSubject: [
      ["Physics", BigInt(74)],
      ["Chemistry", BigInt(68)],
      ["Mathematics", BigInt(82)],
      ["Biology", BigInt(65)],
    ],
    weeklyStudyMinutesPerDay: [
      ["Mon", BigInt(120)],
      ["Tue", BigInt(150)],
      ["Wed", BigInt(90)],
      ["Thu", BigInt(180)],
      ["Fri", BigInt(135)],
      ["Sat", BigInt(200)],
      ["Sun", BigInt(75)],
    ],
  }),

  getSubjectAccuracy: async (): Promise<SubjectAccuracy[]> => [
    {
      subject: "Physics",
      correctAttempts: BigInt(37),
      totalAttempts: BigInt(50),
      accuracyPercent: BigInt(74),
    },
    {
      subject: "Chemistry",
      correctAttempts: BigInt(34),
      totalAttempts: BigInt(50),
      accuracyPercent: BigInt(68),
    },
    {
      subject: "Mathematics",
      correctAttempts: BigInt(41),
      totalAttempts: BigInt(50),
      accuracyPercent: BigInt(82),
    },
    {
      subject: "Biology",
      correctAttempts: BigInt(33),
      totalAttempts: BigInt(50),
      accuracyPercent: BigInt(65),
    },
  ],

  getChatHistory: async (): Promise<ChatMessage[]> => [
    {
      id: BigInt(1),
      role: MessageRole.mentor,
      content:
        "Hi! I'm your AI Prep Mentor. I've analyzed your recent performance and noticed you're doing great in Mathematics but struggling with Organic Chemistry. Let's work on that today!",
      timestamp: BigInt(Date.now() - 3600000),
    },
    {
      id: BigInt(2),
      role: MessageRole.user,
      content:
        "Yes, I find reaction mechanisms really confusing. Can you help?",
      timestamp: BigInt(Date.now() - 3500000),
    },
    {
      id: BigInt(3),
      role: MessageRole.mentor,
      content:
        "Absolutely! The key is to understand electron push-pull mechanisms. Let's start with nucleophilic substitution (SN1 vs SN2). Which one feels more unclear to you?",
      timestamp: BigInt(Date.now() - 3400000),
    },
  ],

  listQuestions: async (
    _subject: string | null,
    _difficulty: Difficulty | null,
  ): Promise<Question[]> => [
    {
      id: BigInt(1),
      topic: "Electromagnetic Induction",
      subject: "Physics",
      difficulty: Difficulty.medium,
      year: BigInt(2023),
      questionText:
        "A conducting rod of length L moves with velocity v perpendicular to a magnetic field B. The induced EMF is:",
      correctOptionIndex: BigInt(1),
      options: ["BL²v", "BLv", "B²Lv", "BLv²"],
    },
    {
      id: BigInt(2),
      topic: "Organic Chemistry",
      subject: "Chemistry",
      difficulty: Difficulty.hard,
      year: BigInt(2022),
      questionText: "In an SN2 reaction, the attacking nucleophile approaches from:",
      correctOptionIndex: BigInt(2),
      options: [
        "Same side as leaving group",
        "Random direction",
        "Opposite side to leaving group",
        "Perpendicular to bond",
      ],
    },
    {
      id: BigInt(3),
      topic: "Limits and Continuity",
      subject: "Mathematics",
      difficulty: Difficulty.easy,
      year: BigInt(2021),
      questionText: "The value of lim(x→0) sin(x)/x is:",
      correctOptionIndex: BigInt(0),
      options: ["1", "0", "∞", "undefined"],
    },
    {
      id: BigInt(4),
      topic: "Cell Biology",
      subject: "Biology",
      difficulty: Difficulty.easy,
      year: BigInt(2022),
      questionText: "Which organelle is known as the powerhouse of the cell?",
      correctOptionIndex: BigInt(0),
      options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi Body"],
    },
    {
      id: BigInt(5),
      topic: "Laws of Motion",
      subject: "Physics",
      difficulty: Difficulty.easy,
      year: BigInt(2020),
      questionText:
        "Newton's second law states that force equals mass times:",
      correctOptionIndex: BigInt(1),
      options: ["velocity", "acceleration", "displacement", "momentum"],
    },
    {
      id: BigInt(6),
      topic: "Chemical Bonding",
      subject: "Chemistry",
      difficulty: Difficulty.medium,
      year: BigInt(2021),
      questionText:
        "The geometry of a water molecule (H₂O) is:",
      correctOptionIndex: BigInt(2),
      options: ["Linear", "Tetrahedral", "Bent (angular)", "Trigonal planar"],
    },
  ],

  markTask: async (_taskId: bigint, _status: TaskStatus): Promise<boolean> =>
    true,

  rescheduleSkipped: async (): Promise<void> => undefined,

  submitAnswer: async (
    _questionId: bigint,
    selectedOptionIndex: bigint,
  ): Promise<boolean> => selectedOptionIndex === BigInt(1),

  sendChatMessage: async (text: string): Promise<ChatMessage[]> => [
    {
      id: BigInt(1),
      role: MessageRole.mentor,
      content:
        "Hi! I'm your AI Prep Mentor. I've analyzed your recent performance and noticed you're doing great in Mathematics but struggling with Organic Chemistry. Let's work on that today!",
      timestamp: BigInt(Date.now() - 3600000),
    },
    {
      id: BigInt(2),
      role: MessageRole.user,
      content:
        "Yes, I find reaction mechanisms really confusing. Can you help?",
      timestamp: BigInt(Date.now() - 3500000),
    },
    {
      id: BigInt(3),
      role: MessageRole.mentor,
      content:
        "Absolutely! The key is to understand electron push-pull mechanisms. Let's start with nucleophilic substitution (SN1 vs SN2). Which one feels more unclear to you?",
      timestamp: BigInt(Date.now() - 3400000),
    },
    {
      id: BigInt(4),
      role: MessageRole.user,
      content: text,
      timestamp: BigInt(Date.now()),
    },
    {
      id: BigInt(5),
      role: MessageRole.mentor,
      content:
        "Great question! Based on your current performance data, I recommend focusing on practice problems with immediate feedback. Your accuracy in this area can improve significantly with consistent effort.",
      timestamp: BigInt(Date.now() + 1000),
    },
  ],

  clearChatHistory: async (): Promise<void> => undefined,

  getAdminConfig: async () => ({
    groqConfigured: false,
    youtubeConfigured: false,
  }),

  getLectureCards: async (_subject: string) => [
    {
      id: "neet-physics-1",
      title: "Complete Physics for NEET 2025 — Mechanics & Laws of Motion",
      channelTitle: "Physics Wallah",
      duration: "2:14:30",
      thumbnailUrl:
        "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      description:
        "Comprehensive coverage of mechanics, Newton's laws, and their applications for NEET preparation.",
      viewCount: "2.4M views",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "neet-chemistry-1",
      title: "Organic Chemistry Reaction Mechanisms — NEET/JEE Full Course",
      channelTitle: "Unacademy NEET",
      duration: "1:45:00",
      thumbnailUrl:
        "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      description:
        "Master SN1, SN2, elimination reactions and named reactions for organic chemistry.",
      viewCount: "1.8M views",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "neet-biology-1",
      title: "Human Physiology & Cell Biology — NEET Biology Complete",
      channelTitle: "Aakash Institute",
      duration: "3:02:15",
      thumbnailUrl:
        "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      description:
        "Detailed study of human physiology systems and cell biology for NEET exam.",
      viewCount: "3.1M views",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "jee-maths-1",
      title: "Calculus & Integration Techniques for JEE Advanced 2025",
      channelTitle: "Vedantu JEE",
      duration: "1:58:45",
      thumbnailUrl:
        "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      description:
        "Complete guide to differential and integral calculus with JEE-level problems.",
      viewCount: "980K views",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "neet-physics-2",
      title: "Electrostatics & Current Electricity — NEET 2025 Crash Course",
      channelTitle: "Physics Wallah",
      duration: "2:30:00",
      thumbnailUrl:
        "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      description:
        "High-yield electrostatics topics with PYQ analysis and important derivations.",
      viewCount: "1.5M views",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      id: "neet-chemistry-2",
      title: "Periodic Table & Chemical Bonding — Quick Revision for NEET",
      channelTitle: "Unacademy NEET",
      duration: "1:20:00",
      thumbnailUrl:
        "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      description:
        "Fast-track revision of inorganic chemistry essentials — periodic trends and molecular geometry.",
      viewCount: "760K views",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  ],

  setGroqApiKey: async (_key: string): Promise<boolean> => false,
  setYoutubeApiKey: async (_key: string): Promise<boolean> => false,
};
