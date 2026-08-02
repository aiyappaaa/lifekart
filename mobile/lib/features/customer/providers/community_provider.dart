import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

class CommunityState {
  final List<CommunityGroup> myGroups;
  final List<CommunityGroup> searchResults;
  final bool isLoading;
  final String? error;

  const CommunityState({
    this.myGroups = const [],
    this.searchResults = const [],
    this.isLoading = false,
    this.error,
  });

  CommunityState copyWith({
    List<CommunityGroup>? myGroups,
    List<CommunityGroup>? searchResults,
    bool? isLoading,
    String? error,
  }) {
    return CommunityState(
      myGroups: myGroups ?? this.myGroups,
      searchResults: searchResults ?? this.searchResults,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class CommunityNotifier extends StateNotifier<CommunityState> {
  final Ref ref;

  CommunityNotifier(this.ref) : super(const CommunityState()) {
    fetchMyGroups();
  }

  Future<void> fetchMyGroups() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/communities/me');
      final groups = (response.data['groups'] as List)
          .map((e) => CommunityGroup.fromJson(e))
          .toList();
      state = state.copyWith(myGroups: groups, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> searchByPincode(String pincode) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/communities/search?pincode=$pincode');
      final results = (response.data['results'] as List)
          .map((e) => CommunityGroup.fromJson(e))
          .toList();
      state = state.copyWith(searchResults: results, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final communityProvider = StateNotifierProvider<CommunityNotifier, CommunityState>((ref) {
  return CommunityNotifier(ref);
});
