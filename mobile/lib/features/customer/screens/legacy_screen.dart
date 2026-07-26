import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/customer_providers.dart';

class LegacyScreen extends ConsumerWidget {
  const LegacyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nomineesAsync = ref.watch(legacyNomineesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Legacy Management')),
      body: nomineesAsync.when(
        data: (nominees) => ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: nominees.length,
          itemBuilder: (context, index) {
            final nominee = nominees[index];
            return GlassCard(
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFFF5A0A),
                  child: Icon(Icons.shield, color: Colors.white),
                ),
                title: Text(nominee.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('${nominee.relation} • Aadhaar: ${nominee.aadhaar}'),
                trailing: IconButton(
                  icon: const Icon(Icons.edit, color: Colors.grey),
                  onPressed: () {},
                ),
              ),
            ).animate().fadeIn(delay: (index * 100).ms).slideY();
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFF5A0A))),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFFF5A0A),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Nominee', style: TextStyle(color: Colors.white)),
        onPressed: () {},
      ).animate().scale(delay: 300.ms),
    );
  }
}
