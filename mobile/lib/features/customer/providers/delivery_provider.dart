import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

class DeliveryState {
  final List<DeliveryEvent> upcoming;
  final List<DeliveryEvent> past;
  final bool isLoading;
  final String? error;

  const DeliveryState({
    this.upcoming = const [],
    this.past = const [],
    this.isLoading = false,
    this.error,
  });

  DeliveryState copyWith({
    List<DeliveryEvent>? upcoming,
    List<DeliveryEvent>? past,
    bool? isLoading,
    String? error,
  }) {
    return DeliveryState(
      upcoming: upcoming ?? this.upcoming,
      past: past ?? this.past,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class DeliveryNotifier extends StateNotifier<DeliveryState> {
  final Ref ref;

  DeliveryNotifier(this.ref) : super(const DeliveryState()) {
    fetchDeliveries();
  }

  Future<void> fetchDeliveries() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get('/deliveries/me');
      
      final upcoming = (response.data['upcoming'] as List)
          .map((e) => DeliveryEvent.fromJson(e))
          .toList();
      final past = (response.data['past'] as List)
          .map((e) => DeliveryEvent.fromJson(e))
          .toList();
          
      state = state.copyWith(
        upcoming: upcoming,
        past: past,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final deliveryProvider = StateNotifierProvider<DeliveryNotifier, DeliveryState>((ref) {
  return DeliveryNotifier(ref);
});
