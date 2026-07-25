class Product {
  final String id;
  final String categoryId;
  final String manufacturerId;
  final String name;
  final String sku;
  final String? description;
  final double unitPriceRetail;
  final double unitPriceWholesale;
  final String? unitSize;
  final String? imageUrl;
  final int stockQuantity;
  final int? minOrderQuantity;
  final int? maxOrderQuantity;
  final bool isActive;

  const Product({
    required this.id,
    required this.categoryId,
    required this.manufacturerId,
    required this.name,
    required this.sku,
    this.description,
    required this.unitPriceRetail,
    required this.unitPriceWholesale,
    this.unitSize,
    this.imageUrl,
    required this.stockQuantity,
    this.minOrderQuantity,
    this.maxOrderQuantity,
    required this.isActive,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      categoryId: json['categoryId'] as String,
      manufacturerId: json['manufacturerId'] as String,
      name: json['name'] as String,
      sku: json['sku'] as String,
      description: json['description'] as String?,
      unitPriceRetail: (json['unitPriceRetail'] as num).toDouble(),
      unitPriceWholesale: (json['unitPriceWholesale'] as num).toDouble(),
      unitSize: json['unitSize'] as String?,
      imageUrl: json['imageUrl'] as String?,
      stockQuantity: json['stockQuantity'] as int,
      minOrderQuantity: json['minOrderQuantity'] as int?,
      maxOrderQuantity: json['maxOrderQuantity'] as int?,
      isActive: json['isActive'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'categoryId': categoryId,
      'manufacturerId': manufacturerId,
      'name': name,
      'sku': sku,
      'description': description,
      'unitPriceRetail': unitPriceRetail,
      'unitPriceWholesale': unitPriceWholesale,
      'unitSize': unitSize,
      'imageUrl': imageUrl,
      'stockQuantity': stockQuantity,
      'minOrderQuantity': minOrderQuantity,
      'maxOrderQuantity': maxOrderQuantity,
      'isActive': isActive,
    };
  }
}
