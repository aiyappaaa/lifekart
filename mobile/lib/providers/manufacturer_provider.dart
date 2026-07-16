import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';

final manufacturerProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.dio.get('/portal/manufacturer/profile');
    return response.data as Map<String, dynamic>;
  } catch (e) {
    return {};
  }
});

final manufacturerAnalyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.dio.get('/portal/manufacturer/analytics');
    return response.data as Map<String, dynamic>;
  } catch (e) {
    return {};
  }
});

final manufacturerProductsProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.dio.get('/portal/manufacturer/products');
    return response.data as List<dynamic>;
  } catch (e) {
    return [];
  }
});
