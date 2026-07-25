class Household {
  final String id;
  final String userId;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String state;
  final String pincode;
  final double? monthlyGroceryBudget;
  final bool preferOrganic;
  final DateTime createdAt;

  const Household({
    required this.id,
    required this.userId,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    required this.state,
    required this.pincode,
    this.monthlyGroceryBudget,
    required this.preferOrganic,
    required this.createdAt,
  });

  factory Household.fromJson(Map<String, dynamic> json) {
    return Household(
      id: json['id'] as String,
      userId: json['userId'] as String,
      addressLine1: json['addressLine1'] as String,
      addressLine2: json['addressLine2'] as String?,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String,
      monthlyGroceryBudget: (json['monthlyGroceryBudget'] as num?)?.toDouble(),
      preferOrganic: json['preferOrganic'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'state': state,
      'pincode': pincode,
      'monthlyGroceryBudget': monthlyGroceryBudget,
      'preferOrganic': preferOrganic,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
