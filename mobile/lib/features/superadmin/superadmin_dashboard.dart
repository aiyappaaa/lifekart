import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/superadmin_provider.dart';

class SuperadminDashboard extends ConsumerWidget {
  const SuperadminDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metricsAsync = ref.watch(adminMetricsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Superadmin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: metricsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error loading metrics: $err')),
        data: (data) {
          final totalSavings = data['total_savings'] ?? '0';
          final activeSubs = data['active_subscriptions'] ?? 0;
          final activeManuf = data['active_manufacturers'] ?? 0;
          final totalUsers = data['total_users'] ?? 0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildStatCard('Platform Savings', '₹$totalSavings', Icons.savings, Colors.green),
              _buildStatCard('Active Subscriptions', '$activeSubs', Icons.list_alt, Colors.blue),
              _buildStatCard('Active Manufacturers', '$activeManuf', Icons.precision_manufacturing, Colors.orange),
              _buildStatCard('Total Users', '$totalUsers', Icons.people, Colors.purple),
            ],
          );
        },
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 8),
                Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
