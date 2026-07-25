import 'package:flutter_riverpod/flutter_riverpod.dart';

class WholesaleAgreement {
  final String id;
  final String title;
  final List<String> items;
  final String rules;
  final bool isActive;
  WholesaleAgreement({required this.id, required this.title, required this.items, required this.rules, required this.isActive});
}

class HouseholdMember {
  final String id;
  final String name;
  final String relation;
  final String dob;
  final List<String> healthTags;
  HouseholdMember({required this.id, required this.name, required this.relation, required this.dob, required this.healthTags});
}

class CommunityGroup {
  final String id;
  final String name;
  final int currentHouseholds;
  final int maxHouseholds;
  final String pincode;
  CommunityGroup({required this.id, required this.name, required this.currentHouseholds, required this.maxHouseholds, required this.pincode});
}

class GiftOrder {
  final String id;
  final String beneficiaryName;
  final String status;
  final double amount;
  GiftOrder({required this.id, required this.beneficiaryName, required this.status, required this.amount});
}

class Invoice {
  final String id;
  final String month;
  final double amount;
  final bool isPaid;
  final List<String> items;
  Invoice({required this.id, required this.month, required this.amount, required this.isPaid, required this.items});
}

class LegacyNominee {
  final String id;
  final String name;
  final String relation;
  final String aadhaar;
  LegacyNominee({required this.id, required this.name, required this.relation, required this.aadhaar});
}

final agreementProvider = FutureProvider.family<WholesaleAgreement, String>((ref, id) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return WholesaleAgreement(id: id, title: 'Annual Healthcare Package', items: ['Doctor Consultations', 'Pharmacy Discounts'], rules: 'Valid for 1 year from activation. Standard terms apply.', isActive: false);
});

final householdMembersProvider = FutureProvider<List<HouseholdMember>>((ref) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return [
    HouseholdMember(id: '1', name: 'John Doe', relation: 'Self', dob: '1980-01-01', healthTags: ['Diabetes']),
    HouseholdMember(id: '2', name: 'Jane Doe', relation: 'Spouse', dob: '1985-05-15', healthTags: [])
  ];
});

final communityGroupsProvider = FutureProvider.family<List<CommunityGroup>, String>((ref, pincode) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return [CommunityGroup(id: 'c1', name: 'Greenwood Society', currentHouseholds: 7, maxHouseholds: 10, pincode: pincode)];
});

final communityDetailProvider = FutureProvider.family<CommunityGroup, String>((ref, id) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return CommunityGroup(id: id, name: 'Greenwood Society', currentHouseholds: 7, maxHouseholds: 10, pincode: '123456');
});

final giftsProvider = FutureProvider<List<GiftOrder>>((ref) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return [GiftOrder(id: 'g1', beneficiaryName: 'Alice', status: 'Active', amount: 5000.0)];
});

final giftDetailProvider = FutureProvider.family<GiftOrder, String>((ref, id) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return GiftOrder(id: id, beneficiaryName: 'Alice', status: 'Active', amount: 5000.0);
});

final invoicesProvider = FutureProvider<List<Invoice>>((ref) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return [Invoice(id: 'inv1', month: 'July 2026', amount: 1500.0, isPaid: false, items: ['Medication', 'Consultation'])];
});

final legacyNomineesProvider = FutureProvider<List<LegacyNominee>>((ref) async {
  await Future.delayed(const Duration(milliseconds: 500));
  return [LegacyNominee(id: 'n1', name: 'Jane Doe', relation: 'Spouse', aadhaar: 'XXXX-XXXX-1234')];
});
