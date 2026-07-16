import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/manufacturer_provider.dart';

class ManufacturerDashboard extends ConsumerWidget {
  const ManufacturerDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(manufacturerProfileProvider);
    final analyticsAsync = ref.watch(manufacturerAnalyticsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manufacturer Hub'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (profile) {
          if (profile.isEmpty) {
            return const Center(child: Text('Manufacturer profile not found.'));
          }
          final companyName = profile['company_name'] ?? 'Company';
          final verified = profile['is_verified'] ?? false;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Text(companyName, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  if (verified) const Padding(
                    padding: EdgeInsets.only(left: 8.0),
                    child: Icon(Icons.verified, color: Colors.blue),
                  )
                ],
              ),
              const SizedBox(height: 16),
              const Text('Analytics', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildAnalytics(analyticsAsync),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add product logic
        },
        child: const Icon(Icons.add_box),
      ),
    );
  }

  Widget _buildAnalytics(AsyncValue<Map<String, dynamic>> analyticsAsync) {
    return analyticsAsync.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => Text('Error: $err'),
      data: (analytics) {
        if (analytics.isEmpty) return const Text('No analytics available');
        
        final revenue = analytics['contracted_revenue'] ?? 0;
        final products = analytics['total_products'] ?? 0;
        final agreements = analytics['active_agreements'] ?? 0;

        return Column(
          children: [
            ListTile(
              leading: const Icon(Icons.monetization_on, color: Colors.green),
              title: const Text('Contracted Revenue'),
              trailing: Text('₹$revenue', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: const Icon(Icons.inventory, color: Colors.orange),
              title: const Text('Active Products'),
              trailing: Text('$products', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: const Icon(Icons.handshake, color: Colors.blue),
              title: const Text('Active Agreements'),
              trailing: Text('$agreements', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
