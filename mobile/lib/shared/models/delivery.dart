import 'product.dart';

class DeliveryEvent {
  final String id;
  final String householdId;
  final String subscriptionId;
  final String productId;
  final DateTime scheduledDate;
  final int quantity;
  final double unitPriceApplied;
  final String status;
  final DateTime? shippedAt;
  final DateTime? deliveredAt;
  final String? notes;
  final Product? product;

  const DeliveryEvent({
    required this.id,
    required this.householdId,
    required this.subscriptionId,
    required this.productId,
    required this.scheduledDate,
    required this.quantity,
    required this.unitPriceApplied,
    required this.status,
    this.shippedAt,
    this.deliveredAt,
    this.notes,
    this.product,
  });

  factory DeliveryEvent.fromJson(Map<String, dynamic> json) {
    return DeliveryEvent(
      id: json['id'] as String,
      householdId: json['householdId'] as String,
      subscriptionId: json['subscriptionId'] as String,
      productId: json['productId'] as String,
      scheduledDate: DateTime.parse(json['scheduledDate'] as String),
      quantity: json['quantity'] as int,
      unitPriceApplied: (json['unitPriceApplied'] as num).toDouble(),
      status: json['status'] as String,
      shippedAt: json['shippedAt'] != null ? DateTime.parse(json['shippedAt'] as String) : null,
      deliveredAt: json['deliveredAt'] != null ? DateTime.parse(json['deliveredAt'] as String) : null,
      notes: json['notes'] as String?,
      product: json['product'] != null ? Product.fromJson(json['product'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'householdId': householdId,
      'subscriptionId': subscriptionId,
      'productId': productId,
      'scheduledDate': scheduledDate.toIso8601String(),
      'quantity': quantity,
      'unitPriceApplied': unitPriceApplied,
      'status': status,
      'shippedAt': shippedAt?.toIso8601String(),
      'deliveredAt': deliveredAt?.toIso8601String(),
      'notes': notes,
      'product': product?.toJson(),
    };
  }
}
