import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

class GiftingState {
  final List<GiftOrder> created;
  final List<GiftOrder> received;
  final bool isLoading;
  final String? error;

  const GiftingState({
    this.created = const [],
    this.received = const [],
    this.isLoading = false,
    this.error,
  });

  GiftingState copyWith({
    List<GiftOrder>? created,
    List<GiftOrder>? received,
    bool? isLoading,
    String? error,
  }) {
    return GiftingState(
      created: created ?? this.created,
      received: received ?? this.received,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class GiftingNotifier extends StateNotifier<GiftingState> {
  final Ref ref;

  GiftingNotifier(this.ref) : super(const GiftingState()) {
    fetchGifts();
  }

  Future<void> fetchGifts() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/api/v1/gifting/me');
      final createdList = (response.data['created'] as List)
          .map((e) => GiftOrder.fromJson(e))
          .toList();
      final receivedList = (response.data['received'] as List)
          .map((e) => GiftOrder.fromJson(e))
          .toList();
      state = state.copyWith(
        created: createdList,
        received: receivedList,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final giftingProvider = StateNotifierProvider<GiftingNotifier, GiftingState>((ref) {
  return GiftingNotifier(ref);
});
