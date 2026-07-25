import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/constants/app_colors.dart';

class BuildContractScreen extends ConsumerStatefulWidget {
  const BuildContractScreen({super.key});

  @override
  ConsumerState<BuildContractScreen> createState() => _BuildContractScreenState();
}

class _BuildContractScreenState extends ConsumerState<BuildContractScreen> {
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Build 60-Year Contract', style: AppTypography.h3),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 3) {
            setState(() => _currentStep += 1);
          } else {
            // Finalize
            context.pop();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          }
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 24.0),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: details.onStepContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF5A0A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(_currentStep == 3 ? 'Confirm Contract' : 'Continue'),
                  ),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 16),
                  TextButton(
                    onPressed: details.onStepCancel,
                    child: const Text('Back'),
                  ),
                ]
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('Select Category'),
            content: _buildCategorySelection(),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Choose Product'),
            content: _buildProductSelection(),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Frequency & Quantity'),
            content: _buildFrequencySelection(),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Review Savings'),
            content: _buildSavingsReview(),
            isActive: _currentStep >= 3,
          ),
        ],
      ).animate().fade(),
    );
  }

  Widget _buildCategorySelection() {
    return DropdownButtonFormField<String>(
      decoration: const InputDecoration(
        labelText: 'Category',
        border: OutlineInputBorder(),
      ),
      items: const [
        DropdownMenuItem(value: 'Groceries', child: Text('Groceries')),
        DropdownMenuItem(value: 'Dairy', child: Text('Dairy')),
        DropdownMenuItem(value: 'Essentials', child: Text('Essentials')),
      ],
      onChanged: (value) {},
    );
  }

  Widget _buildProductSelection() {
    return DropdownButtonFormField<String>(
      decoration: const InputDecoration(
        labelText: 'Product',
        border: OutlineInputBorder(),
      ),
      items: const [
        DropdownMenuItem(value: 'Rice 5kg', child: Text('Premium Rice 5kg')),
        DropdownMenuItem(value: 'Milk 1L', child: Text('Organic Milk 1L')),
      ],
      onChanged: (value) {},
    );
  }

  Widget _buildFrequencySelection() {
    return Column(
      children: [
        DropdownButtonFormField<String>(
          decoration: const InputDecoration(
            labelText: 'Delivery Frequency',
            border: OutlineInputBorder(),
          ),
          items: const [
            DropdownMenuItem(value: 'Daily', child: Text('Daily')),
            DropdownMenuItem(value: 'Weekly', child: Text('Weekly')),
            DropdownMenuItem(value: 'Monthly', child: Text('Monthly')),
          ],
          onChanged: (value) {},
        ),
        const SizedBox(height: 16),
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'Quantity per delivery',
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.number,
          initialValue: '1',
        ),
      ],
    );
  }

  Widget _buildSavingsReview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green),
      ),
      child: Column(
        children: [
          const Text('Estimated 60-Year Savings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text(
            '₹ 15,40,000',
            style: AppTypography.h2.copyWith(color: Colors.green),
          ),
          const SizedBox(height: 8),
          const Text('By locking in today\'s price, you avoid inflation for a lifetime!'),
        ],
      ),
    );
  }
}
