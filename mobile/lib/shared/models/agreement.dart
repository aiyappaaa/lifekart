import 'product.dart';

class WholesaleAgreement {
  final String id;
  final String householdId;
  final String? manufacturerId;
  final String agreementNumber;
  final String status;
  final double totalContractValue;
  final DateTime startDate;
  final DateTime? endDate;
  final DateTime? signedAt;

  const WholesaleAgreement({
    required this.id,
    required this.householdId,
    this.manufacturerId,
    required this.agreementNumber,
    required this.status,
    required this.totalContractValue,
    required this.startDate,
    this.endDate,
    this.signedAt,
  });

  factory WholesaleAgreement.fromJson(Map<String, dynamic> json) {
    return WholesaleAgreement(
      id: json['id'] as String,
      householdId: json['householdId'] as String,
      manufacturerId: json['manufacturerId'] as String?,
      agreementNumber: json['agreementNumber'] as String,
      status: json['status'] as String,
      totalContractValue: (json['totalContractValue'] as num).toDouble(),
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate'] as String) : null,
      signedAt: json['signedAt'] != null ? DateTime.parse(json['signedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'householdId': householdId,
      'manufacturerId': manufacturerId,
      'agreementNumber': agreementNumber,
      'status': status,
      'totalContractValue': totalContractValue,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'signedAt': signedAt?.toIso8601String(),
    };
  }
}

class AgreementItem {
  final String id;
  final String agreementId;
  final String productId;
  final int agreedQuantity;
  final double agreedUnitPrice;
  final int frequencyDays;
  final Product? product;

  const AgreementItem({
    required this.id,
    required this.agreementId,
    required this.productId,
    required this.agreedQuantity,
    required this.agreedUnitPrice,
    required this.frequencyDays,
    this.product,
  });

  factory AgreementItem.fromJson(Map<String, dynamic> json) {
    return AgreementItem(
      id: json['id'] as String,
      agreementId: json['agreementId'] as String,
      productId: json['productId'] as String,
      agreedQuantity: json['agreedQuantity'] as int,
      agreedUnitPrice: (json['agreedUnitPrice'] as num).toDouble(),
      frequencyDays: json['frequencyDays'] as int,
      product: json['product'] != null ? Product.fromJson(json['product'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'agreementId': agreementId,
      'productId': productId,
      'agreedQuantity': agreedQuantity,
      'agreedUnitPrice': agreedUnitPrice,
      'frequencyDays': frequencyDays,
      'product': product?.toJson(),
    };
  }
}
