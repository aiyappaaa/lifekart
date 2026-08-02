import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

class HouseholdState {
  final Household? household;
  final List<HouseholdMember> members;
  final bool isLoading;
  final String? error;

  const HouseholdState({
    this.household,
    this.members = const [],
    this.isLoading = false,
    this.error,
  });

  HouseholdState copyWith({
    Household? household,
    List<HouseholdMember>? members,
    bool? isLoading,
    String? error,
  }) {
    return HouseholdState(
      household: household ?? this.household,
      members: members ?? this.members,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class HouseholdNotifier extends StateNotifier<HouseholdState> {
  final Ref ref;

  HouseholdNotifier(this.ref) : super(const HouseholdState()) {
    fetchHousehold();
  }

  Future<void> fetchHousehold() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/profiling/households/me');
      final household = Household.fromJson(response.data['household']);
      final membersList = (response.data['members'] as List)
          .map((e) => HouseholdMember.fromJson(e))
          .toList();
      state = state.copyWith(
        household: household,
        members: membersList,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addMember(HouseholdMember member) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post(
        '/profiling/households/me/members',
        data: member.toJson(),
      );
      final newMember = HouseholdMember.fromJson(response.data);
      state = state.copyWith(members: [...state.members, newMember]);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> editMember(String id, HouseholdMember member) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.put(
        '/profiling/households/me/members/$id',
        data: member.toJson(),
      );
      final updatedMember = HouseholdMember.fromJson(response.data);
      final updatedMembers = state.members.map((m) {
        return m.id == id ? updatedMember : m;
      }).toList();
      state = state.copyWith(members: updatedMembers);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final householdProvider = StateNotifierProvider<HouseholdNotifier, HouseholdState>((ref) {
  return HouseholdNotifier(ref);
});
