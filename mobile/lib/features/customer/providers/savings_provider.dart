import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

final savingsProvider = FutureProvider.autoDispose<SavingsData>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.get('/api/v1/metrics/savings/me');
  return SavingsData.fromJson(response.data);
});
