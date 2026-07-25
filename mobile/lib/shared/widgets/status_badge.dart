import 'package:flutter/material.dart';
import 'package:lifekart_mobile/core/constants/app_colors.dart';

enum AppStatus {
  active,
  paused,
  pending,
  cancelled,
  completed,
  draft,
  verified,
  rejected,
}

class StatusBadge extends StatelessWidget {
  final String label;
  final AppStatus status;

  const StatusBadge({
    Key? key,
    required this.label,
    required this.status,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case AppStatus.active:
      case AppStatus.completed:
      case AppStatus.verified:
        bgColor = AppColors.successLight;
        textColor = AppColors.successDark;
        break;
      case AppStatus.pending:
      case AppStatus.draft:
        bgColor = AppColors.warningLight;
        textColor = AppColors.warningDark;
        break;
      case AppStatus.cancelled:
      case AppStatus.rejected:
        bgColor = AppColors.dangerLight;
        textColor = AppColors.dangerDark;
        break;
      case AppStatus.paused:
        bgColor = AppColors.infoLight;
        textColor = AppColors.infoDark;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
