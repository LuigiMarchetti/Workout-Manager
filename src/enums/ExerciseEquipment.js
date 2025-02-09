export class ExerciseEquipment {
    static ASSISTED = "assisted";
    static BAND = "band";
    static BARBELL = "barbell";
    static BODY_WEIGHT = "body weight";
    static BOSU_BALL = "bosu ball";
    static CABLE = "cable";
    static DUMBBELL = "dumbbell";
    static ELLIPTICAL_MACHINE = "elliptical machine";
    static EZ_BARBELL = "ez barbell";
    static HAMMER = "hammer";
    static KETTLEBELL = "kettlebell";
    static LEVERAGE_MACHINE = "leverage machine";
    static MEDICINE_BALL = "medicine ball";
    static OLYMPIC_BARBELL = "olympic barbell";
    static RESISTANCE_BAND = "resistance band";
    static ROLLER = "roller";
    static ROPE = "rope";
    static SKIERG_MACHINE = "skierg machine";
    static SLED_MACHINE = "sled machine";
    static SMITH_MACHINE = "smith machine";
    static STABILITY_BALL = "stability ball";
    static STATIONARY_BIKE = "stationary bike";
    static STEPMILL_MACHINE = "stepmill machine";
    static TIRE = "tire";
    static TRAP_BAR = "trap bar";
    static UPPER_BODY_ERGOMETER = "upper body ergometer";
    static WEIGHTED = "weighted";
    static WHEEL_ROLLER = "wheel roller";
  
    // Method to list all equipment
    static values() {
      return [
        this.ASSISTED,
        this.BAND,
        this.BARBELL,
        this.BODY_WEIGHT,
        this.BOSU_BALL,
        this.CABLE,
        this.DUMBBELL,
        this.ELLIPTICAL_MACHINE,
        this.EZ_BARBELL,
        this.HAMMER,
        this.KETTLEBELL,
        this.LEVERAGE_MACHINE,
        this.MEDICINE_BALL,
        this.OLYMPIC_BARBELL,
        this.RESISTANCE_BAND,
        this.ROLLER,
        this.ROPE,
        this.SKIERG_MACHINE,
        this.SLED_MACHINE,
        this.SMITH_MACHINE,
        this.STABILITY_BALL,
        this.STATIONARY_BIKE,
        this.STEPMILL_MACHINE,
        this.TIRE,
        this.TRAP_BAR,
        this.UPPER_BODY_ERGOMETER,
        this.WEIGHTED,
        this.WHEEL_ROLLER
      ];
    }
  
    // Method to check if a value is valid
    static isValid(equipment) {
      return this.values().includes(equipment);
    }
  }
  