import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AnimatedCounter extends StatelessWidget {
  final double value;
  final String prefix;
  final Duration duration;
  final TextStyle? style;

  const AnimatedCounter({
    Key? key,
    required this.value,
    this.prefix = '₹',
    this.duration = const Duration(milliseconds: 1500),
    this.style,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: value),
      duration: duration,
      curve: Curves.easeOutCubic,
      builder: (context, currentValue, child) {
        final formattedNumber = NumberFormat.currency(
          locale: 'en_IN',
          symbol: prefix,
          decimalDigits: 0,
        ).format(currentValue);

        return Text(
          formattedNumber,
          style: style,
        );
      },
    );
  }
}
