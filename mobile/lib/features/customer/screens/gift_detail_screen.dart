import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/customer_providers.dart';

class GiftDetailScreen extends ConsumerWidget {
  final String giftId;
  const GiftDetailScreen({super.key, required this.giftId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formatCurrency = NumberFormat.currency(locale: 'en_IN', symbol: '₹');
    final detailAsync = ref.watch(giftDetailProvider(giftId));

    return Scaffold(
      appBar: AppBar(title: const Text('Gift Details')),
      body: detailAsync.when(
        data: (gift) => Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GlassCard(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Beneficiary', style: TextStyle(color: Colors.grey)),
                      const SizedBox(height: 4),
                      Text(gift.beneficiaryName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      const Text('Amount', style: TextStyle(color: Colors.grey)),
                      const SizedBox(height: 4),
                      Text(formatCurrency.format(gift.amount), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFFFF5A0A))),
                      const SizedBox(height: 16),
                      const Text('Status', style: TextStyle(color: Colors.grey)),
                      const SizedBox(height: 4),
                      Chip(
                        label: Text(gift.status, style: const TextStyle(color: Colors.white)),
                        backgroundColor: Colors.green,
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn().scale(),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: GradientButton(
                  text: 'Download Receipt',
                  onPressed: () {},
                ),
              ).animate().fadeIn(delay: 200.ms),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFF5A0A))),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
