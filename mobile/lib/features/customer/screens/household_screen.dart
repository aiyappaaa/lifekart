import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/customer_providers.dart';

class HouseholdScreen extends ConsumerWidget {
  const HouseholdScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final membersAsync = ref.watch(householdMembersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Household'),
        elevation: 0,
      ),
      body: membersAsync.when(
        data: (members) => ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: members.length,
          itemBuilder: (context, index) {
            final member = members[index];
            return GlassCard(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: const Color(0xFFFF5A0A).withOpacity(0.2),
                  child: const Icon(Icons.person, color: Color(0xFFFF5A0A)),
                ),
                title: Text(member.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('${member.relation} • DOB: ${member.dob}'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  context.push('/customer/member/${member.id}');
                },
              ),
            ).animate().fadeIn(delay: (index * 100).ms).slideX(begin: 0.1);
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFFF5A0A))),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFFF5A0A),
        onPressed: () {
          context.push('/customer/member/new');
        },
        child: const Icon(Icons.add, color: Colors.white),
      ).animate().scale(delay: 300.ms),
    );
  }
}
