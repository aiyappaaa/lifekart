import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

class LegacyState {
  final List<LegacyNominee> nominees;
  final bool isLoading;
  final String? error;

  const LegacyState({
    this.nominees = const [],
    this.isLoading = false,
    this.error,
  });

  LegacyState copyWith({
    List<LegacyNominee>? nominees,
    bool? isLoading,
    String? error,
  }) {
    return LegacyState(
      nominees: nominees ?? this.nominees,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class LegacyNotifier extends StateNotifier<LegacyState> {
  final Ref ref;

  LegacyNotifier(this.ref) : super(const LegacyState()) {
    fetchNominees();
  }

  Future<void> fetchNominees() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/legacy/nominees');
      final list = (response.data['nominees'] as List)
          .map((e) => LegacyNominee.fromJson(e))
          .toList();
      state = state.copyWith(nominees: list, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addNominee(LegacyNominee nominee) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post(
        '/legacy/nominees',
        data: nominee.toJson(),
      );
      final newNominee = LegacyNominee.fromJson(response.data);
      state = state.copyWith(nominees: [...state.nominees, newNominee]);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> editNominee(String id, LegacyNominee nominee) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.put(
        '/legacy/nominees/$id',
        data: nominee.toJson(),
      );
      final updatedNominee = LegacyNominee.fromJson(response.data);
      final updatedList = state.nominees.map((n) {
        return n.id == id ? updatedNominee : n;
      }).toList();
      state = state.copyWith(nominees: updatedList);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final legacyProvider = StateNotifierProvider<LegacyNotifier, LegacyState>((ref) {
  return LegacyNotifier(ref);
});
