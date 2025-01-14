class ExerciseBodyPart {
  static BACK = "back";
  static CARDIO = "cardio";
  static CHEST = "chest";
  static LOWER_ARMS = "lower arms";
  static LOWER_LEGS = "lower legs";
  static NECK = "neck";
  static SHOULDERS = "shoulders";
  static UPPER_ARMS = "upper arms";
  static UPPER_LEGS = "upper legs";
  static WAIST = "waist";

  // Method to list all body parts
  static values() {
    return [
      this.BACK,
      this.CARDIO,
      this.CHEST,
      this.LOWER_ARMS,
      this.LOWER_LEGS,
      this.NECK,
      this.SHOULDERS,
      this.UPPER_ARMS,
      this.UPPER_LEGS,
      this.WAIST
    ];
  }

  // Method to check if a value is valid
  static isValid(bodyPart) {
    return this.values().includes(bodyPart);
  }
}
