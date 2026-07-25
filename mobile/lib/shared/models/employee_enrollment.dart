class EmployeeEnrollment {
  final String id;
  final String corporateId;
  final String? householdId;
  final String? employeeId;
  final String? department;
  final String? designation;
  final DateTime enrolledAt;
  final bool isActive;

  const EmployeeEnrollment({
    required this.id,
    required this.corporateId,
    this.householdId,
    this.employeeId,
    this.department,
    this.designation,
    required this.enrolledAt,
    required this.isActive,
  });

  factory EmployeeEnrollment.fromJson(Map<String, dynamic> json) {
    return EmployeeEnrollment(
      id: json['id'] as String,
      corporateId: json['corporateId'] as String,
      householdId: json['householdId'] as String?,
      employeeId: json['employeeId'] as String?,
      department: json['department'] as String?,
      designation: json['designation'] as String?,
      enrolledAt: DateTime.parse(json['enrolledAt'] as String),
      isActive: json['isActive'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'corporateId': corporateId,
      'householdId': householdId,
      'employeeId': employeeId,
      'department': department,
      'designation': designation,
      'enrolledAt': enrolledAt.toIso8601String(),
      'isActive': isActive,
    };
  }
}
