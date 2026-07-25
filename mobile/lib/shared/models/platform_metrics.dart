class PlatformMetrics {
  final String? id;
  final DateTime recordedAt;
  final double avgHouseholdMonthlySavings;
  final int lifetimeContractsSigned;
  final int activeEmployerPartnerships;
  final int activeHouseholds;
  final double avgWholesaleDiscountPct;
  final double retailCostAvoided;

  const PlatformMetrics({
    this.id,
    required this.recordedAt,
    required this.avgHouseholdMonthlySavings,
    required this.lifetimeContractsSigned,
    required this.activeEmployerPartnerships,
    required this.activeHouseholds,
    required this.avgWholesaleDiscountPct,
    required this.retailCostAvoided,
  });

  factory PlatformMetrics.fromJson(Map<String, dynamic> json) {
    return PlatformMetrics(
      id: json['id'] as String?,
      recordedAt: DateTime.parse(json['recordedAt'] as String),
      avgHouseholdMonthlySavings: (json['avgHouseholdMonthlySavings'] as num).toDouble(),
      lifetimeContractsSigned: json['lifetimeContractsSigned'] as int,
      activeEmployerPartnerships: json['activeEmployerPartnerships'] as int,
      activeHouseholds: json['activeHouseholds'] as int,
      avgWholesaleDiscountPct: (json['avgWholesaleDiscountPct'] as num).toDouble(),
      retailCostAvoided: (json['retailCostAvoided'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recordedAt': recordedAt.toIso8601String(),
      'avgHouseholdMonthlySavings': avgHouseholdMonthlySavings,
      'lifetimeContractsSigned': lifetimeContractsSigned,
      'activeEmployerPartnerships': activeEmployerPartnerships,
      'activeHouseholds': activeHouseholds,
      'avgWholesaleDiscountPct': avgWholesaleDiscountPct,
      'retailCostAvoided': retailCostAvoided,
    };
  }
}
