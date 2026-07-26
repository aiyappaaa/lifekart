import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';

final adminMetricsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get('/analytics/admin/metrics');
  return response.data as Map<String, dynamic>;
});

final adminTrendProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get('/analytics/admin/trend');
  return response.data as List<dynamic>;
});
