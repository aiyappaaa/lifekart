import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/customer_provider.dart';

class CustomerDashboard extends ConsumerStatefulWidget {
  const CustomerDashboard({super.key});

  @override
  ConsumerState<CustomerDashboard> createState() => _CustomerDashboardState();
}

class _CustomerDashboardState extends ConsumerState<CustomerDashboard> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: Center(
        child: _currentIndex == 0
            ? _buildSavingsTracker()
            : const Text('Subscriptions & Household'),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: const Color(0xFFFF5722),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.savings), label: 'Savings'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Subscriptions'),
          BottomNavigationBarItem(icon: Icon(Icons.family_restroom), label: 'Household'),
        ],
      ),
    );
  }

  Widget _buildSavingsTracker() {
    final savingsAsync = ref.watch(savingsProvider);

    return savingsAsync.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => Text('Error loading savings: $err'),
      data: (data) {
        final totalSavings = data['total_savings_lifetime'] ?? 0;
        final currentPlan = data['plan_type'] ?? 'Standard';
        
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Total Lifetime Savings', style: TextStyle(fontSize: 18)),
            const SizedBox(height: 8),
            Text('₹$totalSavings', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.green)),
            const SizedBox(height: 24),
            Text('Current Plan: $currentPlan', style: const TextStyle(color: Colors.grey)),
          ],
        );
      },
    );
  }
}
