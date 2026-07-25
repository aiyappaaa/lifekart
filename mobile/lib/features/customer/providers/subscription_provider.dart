import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

class SubscriptionState {
  final List<LifetimeSubscription> subscriptions;
  final List<AISuggestion> suggestions;
  final bool isLoading;
  final String? error;

  const SubscriptionState({
    this.subscriptions = const [],
    this.suggestions = const [],
    this.isLoading = false,
    this.error,
  });

  SubscriptionState copyWith({
    List<LifetimeSubscription>? subscriptions,
    List<AISuggestion>? suggestions,
    bool? isLoading,
    String? error,
  }) {
    return SubscriptionState(
      subscriptions: subscriptions ?? this.subscriptions,
      suggestions: suggestions ?? this.suggestions,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  final Ref ref;

  SubscriptionNotifier(this.ref) : super(const SubscriptionState()) {
    fetchData();
  }

  Future<void> fetchData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final subsResponse = await apiClient.get('/api/v1/subscriptions/me');
      final suggResponse = await apiClient.get('/api/v1/subscriptions/suggestions');
      
      final subs = (subsResponse.data['subscriptions'] as List)
          .map((e) => LifetimeSubscription.fromJson(e))
          .toList();
      final suggs = (suggResponse.data['suggestions'] as List)
          .map((e) => AISuggestion.fromJson(e))
          .toList();
          
      state = state.copyWith(
        subscriptions: subs,
        suggestions: suggs,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> pauseSubscription(String id) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      await apiClient.post('/api/v1/subscriptions/$id/pause');
      await fetchData();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> resumeSubscription(String id) async {
    try {
      final apiClient = ref.read(apiClientProvider);
      await apiClient.post('/api/v1/subscriptions/$id/resume');
      await fetchData();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final subscriptionProvider = StateNotifierProvider<SubscriptionNotifier, SubscriptionState>((ref) {
  return SubscriptionNotifier(ref);
});
