import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand
  static const Color primary = Color(0xFFFF5A0A);
  
  // Surfaces
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF3F4F6);
  static const Color surfaceBorder = Color(0xFFE5E7EB);
  static const Color background = Color(0xFFF9FAFB);
  static const Color backgroundAlt = Color(0xFFF3F4F6);
  
  // Text
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textMuted = Color(0xFF9CA3AF);

  // Success (Emerald)
  static const Color successBg = Color(0xFFD1FAE5);
  static const Color successText = Color(0xFF065F46);
  static const Color successBorder = Color(0xFF34D399);

  // Warning (Amber)
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color warningText = Color(0xFF92400E);
  static const Color warningBorder = Color(0xFFFBBF24);

  // Danger (Red)
  static const Color dangerBg = Color(0xFFFEE2E2);
  static const Color dangerText = Color(0xFF991B1B);
  static const Color dangerBorder = Color(0xFFF87171);

  // Info (Blue)
  static const Color infoBg = Color(0xFFDBEAFE);
  static const Color infoText = Color(0xFF1E40AF);
  static const Color infoBorder = Color(0xFF60A5FA);

  // Gradients & Overlays
  static const List<Color> heroGradient = [
    Color(0xFFFF5A0A),
    Color(0xFFFF8E4F),
  ];

  static const Color glassWhite10 = Color(0x1AFFFFFF);
  static const Color glassWhite20 = Color(0x33FFFFFF);
}
