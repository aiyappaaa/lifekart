import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';

final savingsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get('/auth/me/savings');
  return response.data as Map<String, dynamic>;
});

final householdProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.get('/profiling/households/me');
    return response.data as Map<String, dynamic>;
  } catch (e) {
    // Return empty or handle 404
    return {};
  }
});
