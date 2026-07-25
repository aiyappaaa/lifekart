import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_typography.dart';

class DeliveriesScreen extends ConsumerWidget {
  const DeliveriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statuses = ['Scheduled', 'Packed', 'Shipped', 'Delivered'];
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Deliveries', style: AppTypography.h3),
        centerTitle: true,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 4,
        itemBuilder: (context, index) {
          final status = statuses[index % statuses.length];
          final color = _getStatusColor(status);
          
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                  if (index != 3)
                    Container(
                      width: 2,
                      height: 80,
                      color: Colors.grey[300],
                    ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Order #LFK-${1000 + index}', style: AppTypography.bodyText.copyWith(fontWeight: FontWeight.bold)),
                          Text('10:00 AM', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Card(
                        elevation: 0,
                        color: Colors.grey[50],
                        shape: RoundedRectangleBorder(
                          side: BorderSide(color: Colors.grey[200]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            children: [
                              const Icon(Icons.shopping_basket_outlined, size: 20, color: Colors.grey),
                              const SizedBox(width: 8),
                              Text('3 Items', style: AppTypography.bodyText),
                              const Spacer(),
                              Text('₹840', style: AppTypography.bodyText.copyWith(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ).animate().fade(delay: (100 * index).ms).slideX();
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Scheduled':
        return Colors.blue;
      case 'Packed':
        return Colors.orange;
      case 'Shipped':
        return Colors.purple;
      case 'Delivered':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
