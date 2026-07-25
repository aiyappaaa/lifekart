import 'package:intl/intl.dart';

class CurrencyFormatter {
  CurrencyFormatter._();

  static String formatINR(double amount) {
    final format = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );
    return format.format(amount);
  }

  static String formatINRCompact(double amount) {
    if (amount >= 10000000) {
      final value = amount / 10000000;
      return '₹${value.toStringAsFixed(value.truncateToDouble() == value ? 0 : 1)}Cr';
    } else if (amount >= 100000) {
      final value = amount / 100000;
      return '₹${value.toStringAsFixed(value.truncateToDouble() == value ? 0 : 1)}L';
    } else if (amount >= 1000) {
      final value = amount / 1000;
      return '₹${value.toStringAsFixed(value.truncateToDouble() == value ? 0 : 1)}K';
    }
    return formatINR(amount);
  }

  static String formatPercentage(double pct) {
    return '${pct.toStringAsFixed(pct.truncateToDouble() == pct ? 0 : 1)}%';
  }
}
