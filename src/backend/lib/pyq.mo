import PYQTypes "../types/pyq";
import Common "../types/common";
import List "mo:core/List";

module {

  // ── Seed data (50 NEET/JEE questions) ─────────────────────────────────────

  type Q = PYQTypes.Question;

  let SEED_QUESTIONS : [Q] = [
    // ── PHYSICS – Easy ───────────────────────────────────────────────────────
    { id = 0;  year = 2019; subject = "Physics";   topic = "Newton's Laws";      difficulty = #easy;
      questionText = "A body of mass 5 kg is acted upon by a net force of 20 N. Its acceleration is:";
      options = ["2 m/s²", "4 m/s²", "10 m/s²", "100 m/s²"]; correctOptionIndex = 1 },
    { id = 1;  year = 2020; subject = "Physics";   topic = "Kinematics";          difficulty = #easy;
      questionText = "A ball is dropped from a height of 20 m. Time to reach the ground (g = 10 m/s²):";
      options = ["1 s", "2 s", "4 s", "5 s"]; correctOptionIndex = 1 },
    { id = 2;  year = 2018; subject = "Physics";   topic = "Work & Energy";       difficulty = #easy;
      questionText = "Work done by a force of 10 N over a displacement of 5 m in the direction of force:";
      options = ["2 J", "15 J", "50 J", "500 J"]; correctOptionIndex = 2 },

    // ── PHYSICS – Medium ──────────────────────────────────────────────────────
    { id = 3;  year = 2021; subject = "Physics";   topic = "Circular Motion";     difficulty = #medium;
      questionText = "A stone of mass 0.5 kg tied to a 1 m string is rotated in a horizontal circle at 4 rad/s. Centripetal force is:";
      options = ["2 N", "4 N", "8 N", "16 N"]; correctOptionIndex = 2 },
    { id = 4;  year = 2019; subject = "Physics";   topic = "Gravitation";         difficulty = #medium;
      questionText = "Escape velocity from Earth's surface (R = 6400 km, g = 9.8 m/s²) is approximately:";
      options = ["7.9 km/s", "11.2 km/s", "15.0 km/s", "5.0 km/s"]; correctOptionIndex = 1 },
    { id = 5;  year = 2022; subject = "Physics";   topic = "Waves";               difficulty = #medium;
      questionText = "The frequency of a wave is 5 Hz and its wavelength is 4 m. The speed of the wave is:";
      options = ["0.8 m/s", "1.25 m/s", "9 m/s", "20 m/s"]; correctOptionIndex = 3 },
    { id = 6;  year = 2020; subject = "Physics";   topic = "Optics";              difficulty = #medium;
      questionText = "A convex lens of focal length 20 cm forms a real image twice the size of the object. Object distance is:";
      options = ["10 cm", "20 cm", "30 cm", "40 cm"]; correctOptionIndex = 2 },
    { id = 7;  year = 2021; subject = "Physics";   topic = "Electrostatics";      difficulty = #medium;
      questionText = "Two charges +3 µC and −3 µC are separated by 30 cm. The electric field at midpoint is:";
      options = ["0", "2.4×10⁵ N/C", "1.2×10⁵ N/C", "4.8×10⁵ N/C"]; correctOptionIndex = 3 },

    // ── PHYSICS – Hard ────────────────────────────────────────────────────────
    { id = 8;  year = 2022; subject = "Physics";   topic = "Electromagnetic Induction"; difficulty = #hard;
      questionText = "An inductor of 0.5 H has a current change rate of 4 A/s. The induced EMF is:";
      options = ["0.125 V", "2 V", "8 V", "4.5 V"]; correctOptionIndex = 1 },
    { id = 9;  year = 2018; subject = "Physics";   topic = "Modern Physics";      difficulty = #hard;
      questionText = "De Broglie wavelength of an electron accelerated through 100 V is approximately:";
      options = ["1.22 Å", "0.122 Å", "12.2 Å", "0.0122 Å"]; correctOptionIndex = 0 },
    { id = 10; year = 2023; subject = "Physics";   topic = "Thermodynamics";      difficulty = #hard;
      questionText = "In a Carnot engine operating between 500 K and 300 K, the efficiency is:";
      options = ["30%", "40%", "50%", "60%"]; correctOptionIndex = 1 },

    // ── CHEMISTRY – Easy ──────────────────────────────────────────────────────
    { id = 11; year = 2019; subject = "Chemistry"; topic = "Periodic Table";      difficulty = #easy;
      questionText = "The element with atomic number 17 belongs to which group?";
      options = ["Group 16", "Group 17", "Group 15", "Group 18"]; correctOptionIndex = 1 },
    { id = 12; year = 2020; subject = "Chemistry"; topic = "Chemical Bonding";    difficulty = #easy;
      questionText = "The shape of water (H₂O) molecule is:";
      options = ["Linear", "Trigonal planar", "Bent/V-shaped", "Tetrahedral"]; correctOptionIndex = 2 },
    { id = 13; year = 2018; subject = "Chemistry"; topic = "Mole Concept";        difficulty = #easy;
      questionText = "Number of molecules in 1 mole of CO₂ (Avogadro's number = 6.022×10²³):";
      options = ["6.022×10²²", "6.022×10²³", "1.204×10²⁴", "3.011×10²³"]; correctOptionIndex = 1 },

    // ── CHEMISTRY – Medium ────────────────────────────────────────────────────
    { id = 14; year = 2021; subject = "Chemistry"; topic = "Electrochemistry";    difficulty = #medium;
      questionText = "EMF of the cell Zn|Zn²⁺||Cu²⁺|Cu (E°Zn = –0.76V, E°Cu = +0.34V):";
      options = ["0.42 V", "0.76 V", "1.10 V", "1.52 V"]; correctOptionIndex = 2 },
    { id = 15; year = 2022; subject = "Chemistry"; topic = "Organic – Alkenes";   difficulty = #medium;
      questionText = "Which reagent converts an alkene to a diol?";
      options = ["Br₂/CCl₄", "Cold dilute KMnO₄", "Ozone then Zn/H₂O", "HBr"]; correctOptionIndex = 1 },
    { id = 16; year = 2020; subject = "Chemistry"; topic = "Equilibrium";         difficulty = #medium;
      questionText = "For N₂ + 3H₂ ⇌ 2NH₃, if Kp = 1.6×10⁻⁴ atm⁻², increasing pressure will:";
      options = ["Shift equilibrium left", "Shift equilibrium right", "No effect", "Increase Kp"]; correctOptionIndex = 1 },
    { id = 17; year = 2019; subject = "Chemistry"; topic = "Solutions";           difficulty = #medium;
      questionText = "Boiling point elevation of 0.5 m glucose solution (Kb water = 0.52 K·kg/mol):";
      options = ["0.26 K", "0.52 K", "1.04 K", "0.13 K"]; correctOptionIndex = 0 },
    { id = 18; year = 2023; subject = "Chemistry"; topic = "Coordination Compounds"; difficulty = #medium;
      questionText = "The IUPAC name of [Cu(NH₃)₄]SO₄ is:";
      options = ["Copper tetrammine sulphate", "Tetraamminecopper(II) sulphate", "Copper(II) ammonia sulphate", "Tetraamine cupric sulphate"]; correctOptionIndex = 1 },

    // ── CHEMISTRY – Hard ──────────────────────────────────────────────────────
    { id = 19; year = 2022; subject = "Chemistry"; topic = "Organic – Mechanisms"; difficulty = #hard;
      questionText = "The product of ozonolysis of 2-butene followed by reductive workup (Zn/H₂O) is:";
      options = ["Butanal", "Two molecules of ethanal", "Propanone + methanal", "2 molecules of propanal"]; correctOptionIndex = 1 },
    { id = 20; year = 2021; subject = "Chemistry"; topic = "Thermochemistry";     difficulty = #hard;
      questionText = "ΔG = ΔH – TΔS. A reaction is spontaneous at all temperatures when:";
      options = ["ΔH > 0, ΔS > 0", "ΔH < 0, ΔS < 0", "ΔH < 0, ΔS > 0", "ΔH > 0, ΔS < 0"]; correctOptionIndex = 2 },
    { id = 21; year = 2018; subject = "Chemistry"; topic = "p-Block Elements";    difficulty = #hard;
      questionText = "Acidic strength order of oxoacids of chlorine is:";
      options = ["HClO < HClO₂ < HClO₃ < HClO₄", "HClO₄ < HClO₃ < HClO₂ < HClO", "HClO₂ < HClO < HClO₃ < HClO₄", "HClO₃ < HClO₄ < HClO < HClO₂"]; correctOptionIndex = 0 },

    // ── BIOLOGY – Easy ────────────────────────────────────────────────────────
    { id = 22; year = 2019; subject = "Biology";   topic = "Cell Biology";        difficulty = #easy;
      questionText = "The powerhouse of the cell is:";
      options = ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"]; correctOptionIndex = 2 },
    { id = 23; year = 2020; subject = "Biology";   topic = "Cell Division";       difficulty = #easy;
      questionText = "DNA replication occurs during which phase of the cell cycle?";
      options = ["G1 phase", "S phase", "G2 phase", "M phase"]; correctOptionIndex = 1 },
    { id = 24; year = 2018; subject = "Biology";   topic = "Plant Physiology";    difficulty = #easy;
      questionText = "Chlorophyll is found in which cell organelle?";
      options = ["Mitochondria", "Nucleus", "Chloroplast", "Vacuole"]; correctOptionIndex = 2 },

    // ── BIOLOGY – Medium ──────────────────────────────────────────────────────
    { id = 25; year = 2021; subject = "Biology";   topic = "Genetics";            difficulty = #medium;
      questionText = "In a dihybrid cross (AaBb × AaBb), what fraction of offspring will be aabb?";
      options = ["1/16", "3/16", "9/16", "1/4"]; correctOptionIndex = 0 },
    { id = 26; year = 2022; subject = "Biology";   topic = "Human Physiology";    difficulty = #medium;
      questionText = "The enzyme that converts fibrinogen to fibrin during blood clotting is:";
      options = ["Trypsin", "Thrombin", "Pepsin", "Lipase"]; correctOptionIndex = 1 },
    { id = 27; year = 2020; subject = "Biology";   topic = "Ecology";             difficulty = #medium;
      questionText = "Which level of an ecological pyramid represents the most energy?";
      options = ["Secondary consumers", "Tertiary consumers", "Primary consumers", "Producers"]; correctOptionIndex = 3 },
    { id = 28; year = 2019; subject = "Biology";   topic = "Reproduction";        difficulty = #medium;
      questionText = "Double fertilization is a characteristic feature of:";
      options = ["Gymnosperms", "Angiosperms", "Pteridophytes", "Bryophytes"]; correctOptionIndex = 1 },
    { id = 29; year = 2023; subject = "Biology";   topic = "Biotechnology";       difficulty = #medium;
      questionText = "The enzyme used to join DNA fragments in recombinant DNA technology is:";
      options = ["Restriction endonuclease", "Helicase", "DNA ligase", "DNA polymerase"]; correctOptionIndex = 2 },

    // ── BIOLOGY – Hard ────────────────────────────────────────────────────────
    { id = 30; year = 2022; subject = "Biology";   topic = "Molecular Biology";   difficulty = #hard;
      questionText = "The anticodon on tRNA that recognises the codon 5'-AUG-3' is:";
      options = ["5'-CAT-3'", "5'-UAC-3'", "3'-UAC-5'", "5'-GTA-3'"]; correctOptionIndex = 2 },
    { id = 31; year = 2021; subject = "Biology";   topic = "Evolution";           difficulty = #hard;
      questionText = "Hardy-Weinberg equilibrium is disturbed by which of the following?";
      options = ["Large population size", "Random mating", "Natural selection", "No mutation"]; correctOptionIndex = 2 },
    { id = 32; year = 2018; subject = "Biology";   topic = "Plant Kingdom";       difficulty = #hard;
      questionText = "Alternation of generations in plants refers to alternation of:";
      options = ["Sporophyte and gametophyte", "Haploid and diploid", "Both A and B", "Vegetative and reproductive phases"]; correctOptionIndex = 2 },

    // ── More questions to reach 50+ ─────────────────────────────────────────
    { id = 33; year = 2022; subject = "Physics";   topic = "Current Electricity"; difficulty = #medium;
      questionText = "Three resistors of 2Ω, 3Ω, 6Ω are connected in parallel. Equivalent resistance is:";
      options = ["11 Ω", "1 Ω", "2 Ω", "3 Ω"]; correctOptionIndex = 1 },
    { id = 34; year = 2021; subject = "Physics";   topic = "Magnetism";           difficulty = #medium;
      questionText = "A proton moves with velocity v in a magnetic field B perpendicular to its motion. The force on the proton is:";
      options = ["evB (inward)", "0", "evB (along velocity)", "evB²"]; correctOptionIndex = 0 },
    { id = 35; year = 2019; subject = "Chemistry"; topic = "Atomic Structure";    difficulty = #easy;
      questionText = "The number of orbitals in the d subshell is:";
      options = ["1", "3", "5", "7"]; correctOptionIndex = 2 },
    { id = 36; year = 2020; subject = "Chemistry"; topic = "Redox Reactions";     difficulty = #medium;
      questionText = "Oxidation number of Mn in KMnO₄ is:";
      options = ["+4", "+6", "+7", "+5"]; correctOptionIndex = 2 },
    { id = 37; year = 2023; subject = "Biology";   topic = "Human Physiology";    difficulty = #easy;
      questionText = "Which blood group is the universal donor?";
      options = ["A", "B", "AB", "O"]; correctOptionIndex = 3 },
    { id = 38; year = 2022; subject = "Biology";   topic = "Genetics";            difficulty = #medium;
      questionText = "Haemophilia is an example of:";
      options = ["Autosomal dominant", "Autosomal recessive", "X-linked dominant", "X-linked recessive"]; correctOptionIndex = 3 },
    { id = 39; year = 2018; subject = "Physics";   topic = "Optics";              difficulty = #easy;
      questionText = "Critical angle is the angle of incidence in a denser medium at which the angle of refraction is:";
      options = ["0°", "45°", "90°", "180°"]; correctOptionIndex = 2 },
    { id = 40; year = 2021; subject = "Chemistry"; topic = "Organic – Alcohols";  difficulty = #medium;
      questionText = "Lucas test is used to distinguish between:";
      options = ["Primary and secondary amines", "Aldehydes and ketones", "Primary, secondary and tertiary alcohols", "Alkenes and alkynes"]; correctOptionIndex = 2 },
    { id = 41; year = 2022; subject = "Biology";   topic = "Ecology";             difficulty = #hard;
      questionText = "Which biogeochemical cycle lacks an atmospheric reservoir?";
      options = ["Carbon cycle", "Nitrogen cycle", "Phosphorus cycle", "Sulphur cycle"]; correctOptionIndex = 2 },
    { id = 42; year = 2020; subject = "Physics";   topic = "Semiconductors";      difficulty = #medium;
      questionText = "In a p-n junction diode under forward bias, the depletion region:";
      options = ["Increases", "Decreases", "Remains same", "Disappears completely"]; correctOptionIndex = 1 },
    { id = 43; year = 2019; subject = "Chemistry"; topic = "Polymers";            difficulty = #easy;
      questionText = "Nylon-6,6 is a polymer of:";
      options = ["Hexamethylenediamine + Adipic acid", "Caprolactam", "Vinyl chloride", "Styrene"]; correctOptionIndex = 0 },
    { id = 44; year = 2023; subject = "Biology";   topic = "Plant Kingdom";       difficulty = #medium;
      questionText = "Spirogyra is placed in which group?";
      options = ["Rhodophyta", "Phaeophyta", "Chlorophyta", "Cyanobacteria"]; correctOptionIndex = 2 },
    { id = 45; year = 2021; subject = "Physics";   topic = "Nuclear Physics";     difficulty = #hard;
      questionText = "In a nuclear reaction ²³⁵U + n → ¹⁴¹Ba + ?Kr + 3n, the mass number of krypton is:";
      options = ["89", "92", "94", "90"]; correctOptionIndex = 1 },
    { id = 46; year = 2022; subject = "Chemistry"; topic = "Biomolecules";        difficulty = #medium;
      questionText = "The monomer unit of starch is:";
      options = ["Fructose", "Galactose", "α-Glucose", "β-Glucose"]; correctOptionIndex = 2 },
    { id = 47; year = 2020; subject = "Biology";   topic = "Animal Kingdom";      difficulty = #medium;
      questionText = "Which of the following is NOT a characteristic of chordates?";
      options = ["Notochord", "Dorsal hollow nerve cord", "Pharyngeal gill slits", "Ventral nerve cord"]; correctOptionIndex = 3 },
    { id = 48; year = 2019; subject = "Physics";   topic = "Fluid Mechanics";     difficulty = #medium;
      questionText = "Bernoulli's principle is based on conservation of:";
      options = ["Mass", "Momentum", "Energy", "Angular momentum"]; correctOptionIndex = 2 },
    { id = 49; year = 2023; subject = "Chemistry"; topic = "d-Block Elements";    difficulty = #hard;
      questionText = "Which transition metal has the highest melting point?";
      options = ["Iron", "Tungsten", "Chromium", "Molybdenum"]; correctOptionIndex = 1 },
    { id = 50; year = 2022; subject = "Biology";   topic = "Molecular Biology";   difficulty = #medium;
      questionText = "Which type of RNA acts as an adapter molecule during translation?";
      options = ["mRNA", "rRNA", "tRNA", "hnRNA"]; correctOptionIndex = 2 },
  ];

  // ── Functions ─────────────────────────────────────────────────────────────

  public func seed(questions : List.List<Q>) {
    if (not questions.isEmpty()) return;
    for (q in SEED_QUESTIONS.values()) {
      questions.add(q);
    };
  };

  public func listQuestions(
    questions : List.List<Q>,
    subjectFilter : ?Common.Subject,
    difficultyFilter : ?Common.Difficulty,
  ) : [Q] {
    questions.filter(func(q : Q) : Bool {
      let subjectMatch = switch (subjectFilter) {
        case null true;
        case (?s) q.subject == s;
      };
      let diffMatch = switch (difficultyFilter) {
        case null true;
        case (?d) q.difficulty == d;
      };
      subjectMatch and diffMatch;
    }).toArray();
  };

  public func submitAnswer(
    questions : List.List<Q>,
    attempts : List.List<PYQTypes.AttemptRecord>,
    questionId : Nat,
    selectedOptionIndex : Nat,
    now : Common.Timestamp,
  ) : Bool {
    let q = questions.find(func(q : Q) : Bool { q.id == questionId });
    switch (q) {
      case null false;
      case (?found) {
        let isCorrect = found.correctOptionIndex == selectedOptionIndex;
        attempts.add({
          questionId = questionId;
          selectedOptionIndex = selectedOptionIndex;
          isCorrect = isCorrect;
          attemptedAt = now;
        });
        isCorrect;
      };
    };
  };

  public func getSubjectAccuracy(
    attempts : List.List<PYQTypes.AttemptRecord>,
    questions : List.List<Q>,
  ) : [PYQTypes.SubjectAccuracy] {
    // Collect unique subjects
    let subjects : List.List<Common.Subject> = List.empty();
    questions.forEach(func(q : Q) {
      if (subjects.find(func(s : Common.Subject) : Bool { s == q.subject }) == null) {
        subjects.add(q.subject);
      };
    });

    let result : List.List<PYQTypes.SubjectAccuracy> = List.empty();
    subjects.forEach(func(subj : Common.Subject) {
      var total = 0;
      var correct = 0;
      attempts.forEach(func(a : PYQTypes.AttemptRecord) {
        let qOpt = questions.find(func(q : Q) : Bool { q.id == a.questionId });
        switch (qOpt) {
          case (?q) {
            if (q.subject == subj) {
              total += 1;
              if (a.isCorrect) correct += 1;
            };
          };
          case null {};
        };
      });
      let acc = if (total == 0) 0 else (correct * 100) / total;
      result.add({ subject = subj; totalAttempts = total; correctAttempts = correct; accuracyPercent = acc });
    });
    result.toArray();
  };
};
