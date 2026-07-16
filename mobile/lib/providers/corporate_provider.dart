import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';

final corporatePartnerProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.dio.get('/corporate/partners/me');
    return response.data as Map<String, dynamic>;
  } catch (e) {
    return {};
  }
});

final corporateEmployeesProvider = FutureProvider<List<dynamic>>((ref) async {
  final api = ref.watch(apiClientProvider);
  try {
    final response = await api.dio.get('/corporate/partners/me/employees');
    return response.data as List<dynamic>;
  } catch (e) {
    return [];
  }
});
