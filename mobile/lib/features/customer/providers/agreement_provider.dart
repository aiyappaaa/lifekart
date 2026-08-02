import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

final agreementProvider = FutureProvider.autoDispose<List<WholesaleAgreement>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.get('/agreements/me');
  return (response.data['agreements'] as List)
      .map((e) => WholesaleAgreement.fromJson(e))
      .toList();
});
