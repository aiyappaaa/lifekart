class Member {
  final String id;
  final String householdId;
  final String fullName;
  final DateTime dateOfBirth;
  final String familyRelation;
  final String gender;
  final String? dietaryPreference;
  final String? activityLevel;

  const Member({
    required this.id,
    required this.householdId,
    required this.fullName,
    required this.dateOfBirth,
    required this.familyRelation,
    required this.gender,
    this.dietaryPreference,
    this.activityLevel,
  });

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'] as String,
      householdId: json['householdId'] as String,
      fullName: json['fullName'] as String,
      dateOfBirth: DateTime.parse(json['dateOfBirth'] as String),
      familyRelation: json['familyRelation'] as String,
      gender: json['gender'] as String,
      dietaryPreference: json['dietaryPreference'] as String?,
      activityLevel: json['activityLevel'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'householdId': householdId,
      'fullName': fullName,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'familyRelation': familyRelation,
      'gender': gender,
      'dietaryPreference': dietaryPreference,
      'activityLevel': activityLevel,
    };
  }
}
