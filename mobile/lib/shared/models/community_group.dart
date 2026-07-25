class CommunityGroup {
  final String id;
  final String name;
  final String? locality;
  final String city;
  final String state;
  final String pincode;
  final String? adminHouseholdId;
  final int minHouseholdsForPooling;
  final bool isPrivate;
  final String status;
  final int? memberCount;

  const CommunityGroup({
    required this.id,
    required this.name,
    this.locality,
    required this.city,
    required this.state,
    required this.pincode,
    this.adminHouseholdId,
    required this.minHouseholdsForPooling,
    required this.isPrivate,
    required this.status,
    this.memberCount,
  });

  factory CommunityGroup.fromJson(Map<String, dynamic> json) {
    return CommunityGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      locality: json['locality'] as String?,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String,
      adminHouseholdId: json['adminHouseholdId'] as String?,
      minHouseholdsForPooling: json['minHouseholdsForPooling'] as int,
      isPrivate: json['isPrivate'] as bool,
      status: json['status'] as String,
      memberCount: json['memberCount'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'locality': locality,
      'city': city,
      'state': state,
      'pincode': pincode,
      'adminHouseholdId': adminHouseholdId,
      'minHouseholdsForPooling': minHouseholdsForPooling,
      'isPrivate': isPrivate,
      'status': status,
      'memberCount': memberCount,
    };
  }
}

class CommunityMembership {
  final String id;
  final String groupId;
  final String householdId;
  final DateTime joinedAt;

  const CommunityMembership({
    required this.id,
    required this.groupId,
    required this.householdId,
    required this.joinedAt,
  });

  factory CommunityMembership.fromJson(Map<String, dynamic> json) {
    return CommunityMembership(
      id: json['id'] as String,
      groupId: json['groupId'] as String,
      householdId: json['householdId'] as String,
      joinedAt: DateTime.parse(json['joinedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'groupId': groupId,
      'householdId': householdId,
      'joinedAt': joinedAt.toIso8601String(),
    };
  }
}
