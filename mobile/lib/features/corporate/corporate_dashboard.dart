import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/corporate_provider.dart';

class CorporateDashboard extends ConsumerWidget {
  const CorporateDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final partnerAsync = ref.watch(corporatePartnerProvider);
    final employeesAsync = ref.watch(corporateEmployeesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Corporate Portal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: partnerAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (partner) {
          if (partner.isEmpty) {
            return const Center(child: Text('Corporate profile not found.'));
          }
          final companyName = partner['company_name'] ?? 'Company';
          final allowance = partner['monthly_allowance_per_employee'] ?? 0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(companyName, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Monthly Allowance: ₹$allowance / employee', style: const TextStyle(fontSize: 16, color: Colors.grey)),
              const Divider(height: 32),
              const Text('Employees', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildEmployeeList(employeesAsync),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add employee logic
        },
        child: const Icon(Icons.person_add),
      ),
    );
  }

  Widget _buildEmployeeList(AsyncValue<List<dynamic>> employeesAsync) {
    return employeesAsync.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => Text('Error: $err'),
      data: (employees) {
        if (employees.isEmpty) {
          return const Text('No employees enrolled yet.');
        }
        return Column(
          children: employees.map((emp) {
            return ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person)),
              title: Text(emp['employee_id'] ?? 'Unknown ID'),
              subtitle: Text(emp['is_active'] ? 'Active' : 'Inactive'),
              trailing: const Icon(Icons.chevron_right),
            );
          }).toList(),
        );
      },
    );
  }
}
