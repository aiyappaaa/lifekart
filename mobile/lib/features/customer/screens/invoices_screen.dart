import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/customer_providers.dart';

class InvoicesScreen extends ConsumerWidget {
  const InvoicesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹');
    final invoicesAsync = ref.watch(invoicesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Invoices')),
      body: invoicesAsync.when(
        data: (invoices) => ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: invoices.length,
          itemBuilder: (context, index) {
            final inv = invoices[index];
            return GlassCard(
              child: ExpansionTile(
                title: Text(inv.month, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('Total: ${formatCurrency.format(inv.amount)}'),
                trailing: Icon(
                  inv.isPaid ? Icons.check_circle : Icons.pending,
                  color: inv.isPaid ? Colors.green : Colors.orange,
                ),
                children: [
                  ...inv.items.map((item) => ListTile(
                    title: Text(item),
                    leading: const Icon(Icons.arrow_right, color: Color(0xFFFF5A0A)),
                  )),
                  if (!inv.isPaid)
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: GradientButton(
                        text: 'Pay Now',
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Processing payment...')));
                        },
                      ),
                    ),
                ],
              ),
            ).animate().fadeIn(delay: (index * 100).ms).slideX();
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFF5A0A))),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
