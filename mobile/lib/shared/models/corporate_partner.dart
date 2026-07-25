class CorporatePartner {
  final String id;
  final String userId;
  final String companyName;
  final String? gstin;
  final String? industry;
  final int? employeeCount;
  final String? contactEmail;
  final String? city;
  final String? state;
  final String? pincode;
  final String partnershipStatus;
  final double? subsidyPercentage;
  final double? maxEmployeeBenefit;
  final DateTime? agreementSignedAt;

  const CorporatePartner({
    required this.id,
    required this.userId,
    required this.companyName,
    this.gstin,
    this.industry,
    this.employeeCount,
    this.contactEmail,
    this.city,
    this.state,
    this.pincode,
    required this.partnershipStatus,
    this.subsidyPercentage,
    this.maxEmployeeBenefit,
    this.agreementSignedAt,
  });

  factory CorporatePartner.fromJson(Map<String, dynamic> json) {
    return CorporatePartner(
      id: json['id'] as String,
      userId: json['userId'] as String,
      companyName: json['companyName'] as String,
      gstin: json['gstin'] as String?,
      industry: json['industry'] as String?,
      employeeCount: json['employeeCount'] as int?,
      contactEmail: json['contactEmail'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      pincode: json['pincode'] as String?,
      partnershipStatus: json['partnershipStatus'] as String,
      subsidyPercentage: (json['subsidyPercentage'] as num?)?.toDouble(),
      maxEmployeeBenefit: (json['maxEmployeeBenefit'] as num?)?.toDouble(),
      agreementSignedAt: json['agreementSignedAt'] != null ? DateTime.parse(json['agreementSignedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'companyName': companyName,
      'gstin': gstin,
      'industry': industry,
      'employeeCount': employeeCount,
      'contactEmail': contactEmail,
      'city': city,
      'state': state,
      'pincode': pincode,
      'partnershipStatus': partnershipStatus,
      'subsidyPercentage': subsidyPercentage,
      'maxEmployeeBenefit': maxEmployeeBenefit,
      'agreementSignedAt': agreementSignedAt?.toIso8601String(),
    };
  }
}
