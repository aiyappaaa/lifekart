class LegacyNominee {
  final String id;
  final String householdId;
  final String nomineeName;
  final String nomineeRelationship;
  final String? nomineePhone;
  final String? nomineeEmail;
  final String? nomineeAadhaar;
  final bool isPrimary;
  final bool isVerified;
  final String? verificationStatus;

  const LegacyNominee({
    required this.id,
    required this.householdId,
    required this.nomineeName,
    required this.nomineeRelationship,
    this.nomineePhone,
    this.nomineeEmail,
    this.nomineeAadhaar,
    required this.isPrimary,
    required this.isVerified,
    this.verificationStatus,
  });

  factory LegacyNominee.fromJson(Map<String, dynamic> json) {
    return LegacyNominee(
      id: json['id'] as String,
      householdId: json['householdId'] as String,
      nomineeName: json['nomineeName'] as String,
      nomineeRelationship: json['nomineeRelationship'] as String,
      nomineePhone: json['nomineePhone'] as String?,
      nomineeEmail: json['nomineeEmail'] as String?,
      nomineeAadhaar: json['nomineeAadhaar'] as String?,
      isPrimary: json['isPrimary'] as bool,
      isVerified: json['isVerified'] as bool,
      verificationStatus: json['verificationStatus'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'householdId': householdId,
      'nomineeName': nomineeName,
      'nomineeRelationship': nomineeRelationship,
      'nomineePhone': nomineePhone,
      'nomineeEmail': nomineeEmail,
      'nomineeAadhaar': nomineeAadhaar,
      'isPrimary': isPrimary,
      'isVerified': isVerified,
      'verificationStatus': verificationStatus,
    };
  }
}
