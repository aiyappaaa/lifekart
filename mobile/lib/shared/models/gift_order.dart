class GiftOrder {
  final String id;
  final String benefactorHouseholdId;
  final String? recipientHouseholdId;
  final String beneficiaryName;
  final DateTime? beneficiaryDob;
  final String? beneficiaryRelationship;
  final int? startAge;
  final int? endAge;
  final String status;
  final double totalValueLocked;
  final String paymentStatus;
  final DateTime? claimedAt;

  const GiftOrder({
    required this.id,
    required this.benefactorHouseholdId,
    this.recipientHouseholdId,
    required this.beneficiaryName,
    this.beneficiaryDob,
    this.beneficiaryRelationship,
    this.startAge,
    this.endAge,
    required this.status,
    required this.totalValueLocked,
    required this.paymentStatus,
    this.claimedAt,
  });

  factory GiftOrder.fromJson(Map<String, dynamic> json) {
    return GiftOrder(
      id: json['id'] as String,
      benefactorHouseholdId: json['benefactorHouseholdId'] as String,
      recipientHouseholdId: json['recipientHouseholdId'] as String?,
      beneficiaryName: json['beneficiaryName'] as String,
      beneficiaryDob: json['beneficiaryDob'] != null ? DateTime.parse(json['beneficiaryDob'] as String) : null,
      beneficiaryRelationship: json['beneficiaryRelationship'] as String?,
      startAge: json['startAge'] as int?,
      endAge: json['endAge'] as int?,
      status: json['status'] as String,
      totalValueLocked: (json['totalValueLocked'] as num).toDouble(),
      paymentStatus: json['paymentStatus'] as String,
      claimedAt: json['claimedAt'] != null ? DateTime.parse(json['claimedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'benefactorHouseholdId': benefactorHouseholdId,
      'recipientHouseholdId': recipientHouseholdId,
      'beneficiaryName': beneficiaryName,
      'beneficiaryDob': beneficiaryDob?.toIso8601String(),
      'beneficiaryRelationship': beneficiaryRelationship,
      'startAge': startAge,
      'endAge': endAge,
      'status': status,
      'totalValueLocked': totalValueLocked,
      'paymentStatus': paymentStatus,
      'claimedAt': claimedAt?.toIso8601String(),
    };
  }
}

class GiftOrderItem {
  final String id;
  final String giftOrderId;
  final String productId;
  final int? ageTrigger;
  final String? sizeProgression;
  final double lockedPrice;
  final int frequencyDays;
  final int quantityPerDelivery;

  const GiftOrderItem({
    required this.id,
    required this.giftOrderId,
    required this.productId,
    this.ageTrigger,
    this.sizeProgression,
    required this.lockedPrice,
    required this.frequencyDays,
    required this.quantityPerDelivery,
  });

  factory GiftOrderItem.fromJson(Map<String, dynamic> json) {
    return GiftOrderItem(
      id: json['id'] as String,
      giftOrderId: json['giftOrderId'] as String,
      productId: json['productId'] as String,
      ageTrigger: json['ageTrigger'] as int?,
      sizeProgression: json['sizeProgression'] as String?,
      lockedPrice: (json['lockedPrice'] as num).toDouble(),
      frequencyDays: json['frequencyDays'] as int,
      quantityPerDelivery: json['quantityPerDelivery'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'giftOrderId': giftOrderId,
      'productId': productId,
      'ageTrigger': ageTrigger,
      'sizeProgression': sizeProgression,
      'lockedPrice': lockedPrice,
      'frequencyDays': frequencyDays,
      'quantityPerDelivery': quantityPerDelivery,
    };
  }
}
