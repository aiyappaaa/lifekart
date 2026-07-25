import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../shared/widgets/widgets.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Simulated loading state
    final isLoading = false;

    return Scaffold(
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Welcome back, Alex!', style: AppTypography.h2),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFF5A0A), Color(0xFFFF8040)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Lifetime Savings',
                                  style: AppTypography.bodyText.copyWith(color: Colors.white),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Text(
                                      '₹',
                                      style: AppTypography.h1.copyWith(color: Colors.white),
                                    ),
                                    Text(
                                      '12,450',
                                      style: AppTypography.h1.copyWith(color: Colors.white),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ).animate().fade().scale(),
                          const SizedBox(height: 24),
                          Text('Quick Actions', style: AppTypography.h3),
                          const SizedBox(height: 16),
                          GridView.count(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisCount: 2,
                            mainAxisSpacing: 16,
                            crossAxisSpacing: 16,
                            childAspectRatio: 1.5,
                            children: [
                              _buildActionCard(
                                context,
                                'New Contract',
                                Icons.add_circle_outline,
                                () => context.push('/build-contract'),
                              ),
                              _buildActionCard(
                                context,
                                'Agreements',
                                Icons.description_outlined,
                                () => context.push('/agreements'),
                              ),
                            ],
                          ).animate().fade().slideY(begin: 0.2),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Active Subscriptions', style: AppTypography.h3),
                              TextButton(
                                onPressed: () {}, // Handled by shell tab normally
                                child: const Text('View All'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: 3,
                            itemBuilder: (context, index) {
                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: ListTile(
                                  leading: Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: Colors.grey[200],
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(Icons.shopping_bag_outlined),
                                  ),
                                  title: Text('Organic Rice ${index + 1}kg', style: AppTypography.bodyText),
                                  subtitle: const Text('Next delivery: Tomorrow'),
                                  trailing: const Icon(Icons.chevron_right),
                                ),
                              ).animate().fade(delay: (100 * index).ms).slideX();
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, String title, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: const Color(0xFFFF5A0A), size: 32),
            const SizedBox(height: 8),
            Text(title, style: AppTypography.bodyText.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
