class Manufacturer {
  final String id;
  final String userId;
  final String companyName;
  final String? businessRegNumber;
  final String? contactPerson;
  final String? email;
  final String? phone;
  final String? address;
  final String? city;
  final String? state;
  final String? pincode;
  final int? leadTimeDays;
  final bool isVerified;

  const Manufacturer({
    required this.id,
    required this.userId,
    required this.companyName,
    this.businessRegNumber,
    this.contactPerson,
    this.email,
    this.phone,
    this.address,
    this.city,
    this.state,
    this.pincode,
    this.leadTimeDays,
    required this.isVerified,
  });

  factory Manufacturer.fromJson(Map<String, dynamic> json) {
    return Manufacturer(
      id: json['id'] as String,
      userId: json['userId'] as String,
      companyName: json['companyName'] as String,
      businessRegNumber: json['businessRegNumber'] as String?,
      contactPerson: json['contactPerson'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      pincode: json['pincode'] as String?,
      leadTimeDays: json['leadTimeDays'] as int?,
      isVerified: json['isVerified'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'companyName': companyName,
      'businessRegNumber': businessRegNumber,
      'contactPerson': contactPerson,
      'email': email,
      'phone': phone,
      'address': address,
      'city': city,
      'state': state,
      'pincode': pincode,
      'leadTimeDays': leadTimeDays,
      'isVerified': isVerified,
    };
  }
}
