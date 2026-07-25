import 'product.dart';

class LifetimeSubscription {
  final String id;
  final String householdId;
  final String? memberId;
  final String productId;
  final int quantityPerDelivery;
  final int frequencyDays;
  final DateTime startDate;
  final DateTime? endDate;
  final DateTime? nextDeliveryDate;
  final String status;
  final double lockedUnitPrice;
  final double? priceCeilingPct;
  final DateTime? pausedAt;
  final String? pauseReason;
  final Product? product;

  const LifetimeSubscription({
    required this.id,
    required this.householdId,
    this.memberId,
    required this.productId,
    required this.quantityPerDelivery,
    required this.frequencyDays,
    required this.startDate,
    this.endDate,
    this.nextDeliveryDate,
    required this.status,
    required this.lockedUnitPrice,
    this.priceCeilingPct,
    this.pausedAt,
    this.pauseReason,
    this.product,
  });

  factory LifetimeSubscription.fromJson(Map<String, dynamic> json) {
    return LifetimeSubscription(
      id: json['id'] as String,
      householdId: json['householdId'] as String,
      memberId: json['memberId'] as String?,
      productId: json['productId'] as String,
      quantityPerDelivery: json['quantityPerDelivery'] as int,
      frequencyDays: json['frequencyDays'] as int,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate'] as String) : null,
      nextDeliveryDate: json['nextDeliveryDate'] != null ? DateTime.parse(json['nextDeliveryDate'] as String) : null,
      status: json['status'] as String,
      lockedUnitPrice: (json['lockedUnitPrice'] as num).toDouble(),
      priceCeilingPct: (json['priceCeilingPct'] as num?)?.toDouble(),
      pausedAt: json['pausedAt'] != null ? DateTime.parse(json['pausedAt'] as String) : null,
      pauseReason: json['pauseReason'] as String?,
      product: json['product'] != null ? Product.fromJson(json['product'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'householdId': householdId,
      'memberId': memberId,
      'productId': productId,
      'quantityPerDelivery': quantityPerDelivery,
      'frequencyDays': frequencyDays,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'nextDeliveryDate': nextDeliveryDate?.toIso8601String(),
      'status': status,
      'lockedUnitPrice': lockedUnitPrice,
      'priceCeilingPct': priceCeilingPct,
      'pausedAt': pausedAt?.toIso8601String(),
      'pauseReason': pauseReason,
      'product': product?.toJson(),
    };
  }
}
