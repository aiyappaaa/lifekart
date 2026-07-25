import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/customer_providers.dart';

class AgreementDetailScreen extends ConsumerWidget {
  final String agreementId;

  const AgreementDetailScreen({super.key, required this.agreementId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final agreementAsync = ref.watch(agreementProvider(agreementId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agreement Details'),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: agreementAsync.when(
        data: (agreement) => SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                agreement.title,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFFFF5A0A)),
              ).animate().fadeIn().slideY(begin: -0.2),
              const SizedBox(height: 24),
              const Text('Included Items', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))
                  .animate().fadeIn(delay: 100.ms),
              const SizedBox(height: 8),
              ...agreement.items.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4.0),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 20),
                        const SizedBox(width: 8),
                        Text(item, style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                  )).toList().animate(interval: 50.ms).fadeIn().slideX(begin: -0.1),
              const SizedBox(height: 24),
              const Text('Legal Rules', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))
                  .animate().fadeIn(delay: 200.ms),
              const SizedBox(height: 8),
              GlassCard(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(agreement.rules, style: const TextStyle(fontSize: 14)),
                ),
              ).animate().fadeIn(delay: 300.ms).scale(),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: GradientButton(
                  text: agreement.isActive ? 'Active' : 'Sign & Activate',
                  onPressed: agreement.isActive ? null : () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Agreement Signed!')));
                  },
                ),
              ).animate().fadeIn(delay: 400.ms).shimmer(),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFF5A0A))),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
