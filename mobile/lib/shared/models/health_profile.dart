class HealthProfile {
  final String id;
  final String memberId;
  final String? bloodGroup;
  final double? heightCm;
  final double? weightKg;
  final List<String> existingConditions;
  final List<String> allergies;

  const HealthProfile({
    required this.id,
    required this.memberId,
    this.bloodGroup,
    this.heightCm,
    this.weightKg,
    required this.existingConditions,
    required this.allergies,
  });

  factory HealthProfile.fromJson(Map<String, dynamic> json) {
    return HealthProfile(
      id: json['id'] as String,
      memberId: json['memberId'] as String,
      bloodGroup: json['bloodGroup'] as String?,
      heightCm: (json['heightCm'] as num?)?.toDouble(),
      weightKg: (json['weightKg'] as num?)?.toDouble(),
      existingConditions: (json['existingConditions'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      allergies: (json['allergies'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'memberId': memberId,
      'bloodGroup': bloodGroup,
      'heightCm': heightCm,
      'weightKg': weightKg,
      'existingConditions': existingConditions,
      'allergies': allergies,
    };
  }
}

class HealthTransition {
  final String id;
  final String healthProfileId;
  final String transitionType;
  final String conditionName;
  final DateTime triggerDate;
  final String? notes;
  final bool isApplied;

  const HealthTransition({
    required this.id,
    required this.healthProfileId,
    required this.transitionType,
    required this.conditionName,
    required this.triggerDate,
    this.notes,
    required this.isApplied,
  });

  factory HealthTransition.fromJson(Map<String, dynamic> json) {
    return HealthTransition(
      id: json['id'] as String,
      healthProfileId: json['healthProfileId'] as String,
      transitionType: json['transitionType'] as String,
      conditionName: json['conditionName'] as String,
      triggerDate: DateTime.parse(json['triggerDate'] as String),
      notes: json['notes'] as String?,
      isApplied: json['isApplied'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'healthProfileId': healthProfileId,
      'transitionType': transitionType,
      'conditionName': conditionName,
      'triggerDate': triggerDate.toIso8601String(),
      'notes': notes,
      'isApplied': isApplied,
    };
  }
}
