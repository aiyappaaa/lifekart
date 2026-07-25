import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/models.dart';

final invoiceProvider = FutureProvider.autoDispose<List<Invoice>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.get('/api/v1/invoices/me');
  return (response.data['invoices'] as List)
      .map((e) => Invoice.fromJson(e))
      .toList();
});
