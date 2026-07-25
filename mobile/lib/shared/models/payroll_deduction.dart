class PayrollDeduction {
  final String id;
  final String employeeEnrollmentId;
  final DateTime payPeriodStart;
  final DateTime payPeriodEnd;
  final double subscriptionValue;
  final double employerSubsidy;
  final double amountDeducted;
  final String status;
  final DateTime? deductionScheduledDate;
  final DateTime? processedAt;
  final String? externalRef;

  const PayrollDeduction({
    required this.id,
    required this.employeeEnrollmentId,
    required this.payPeriodStart,
    required this.payPeriodEnd,
    required this.subscriptionValue,
    required this.employerSubsidy,
    required this.amountDeducted,
    required this.status,
    this.deductionScheduledDate,
    this.processedAt,
    this.externalRef,
  });

  factory PayrollDeduction.fromJson(Map<String, dynamic> json) {
    return PayrollDeduction(
      id: json['id'] as String,
      employeeEnrollmentId: json['employeeEnrollmentId'] as String,
      payPeriodStart: DateTime.parse(json['payPeriodStart'] as String),
      payPeriodEnd: DateTime.parse(json['payPeriodEnd'] as String),
      subscriptionValue: (json['subscriptionValue'] as num).toDouble(),
      employerSubsidy: (json['employerSubsidy'] as num).toDouble(),
      amountDeducted: (json['amountDeducted'] as num).toDouble(),
      status: json['status'] as String,
      deductionScheduledDate: json['deductionScheduledDate'] != null ? DateTime.parse(json['deductionScheduledDate'] as String) : null,
      processedAt: json['processedAt'] != null ? DateTime.parse(json['processedAt'] as String) : null,
      externalRef: json['externalRef'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employeeEnrollmentId': employeeEnrollmentId,
      'payPeriodStart': payPeriodStart.toIso8601String(),
      'payPeriodEnd': payPeriodEnd.toIso8601String(),
      'subscriptionValue': subscriptionValue,
      'employerSubsidy': employerSubsidy,
      'amountDeducted': amountDeducted,
      'status': status,
      'deductionScheduledDate': deductionScheduledDate?.toIso8601String(),
      'processedAt': processedAt?.toIso8601String(),
      'externalRef': externalRef,
    };
  }
}
