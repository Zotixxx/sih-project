import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool isSmall;

  const StatusBadge({
    super.key,
    required this.status,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    final normalized = status.toUpperCase();
    late final Color bg;
    late final Color fg;
    late final String label;
    late final IconData icon;

    switch (normalized) {
      case 'APPROVED':
      case 'CERTIFIED':
      case 'COMPLETED':
      case 'VALID':
        bg = AppTheme.emeraldLight;
        fg = AppTheme.emeraldGreen;
        label = normalized == 'VALID' ? 'VALID' : 'APPROVED';
        icon = Icons.verified_outlined;
        break;
      case 'SUBMITTED':
      case 'SUBMITTED_FOR_APPROVAL':
        bg = AppTheme.emeraldLight;
        fg = AppTheme.emeraldGreen;
        label = 'SUBMITTED';
        icon = Icons.task_alt;
        break;
      case 'IN_PROGRESS':
      case 'UNDER_VERIFICATION':
        bg = AppTheme.blueLight;
        fg = AppTheme.blueInfo;
        label = 'IN PROGRESS';
        icon = Icons.edit_note;
        break;
      case 'ASSIGNED':
      case 'SCHEDULED':
        bg = AppTheme.amberLight;
        fg = AppTheme.amberWarning;
        label = 'ASSIGNED';
        icon = Icons.schedule_outlined;
        break;
      case 'RETURNED':
        bg = AppTheme.amberLight;
        fg = AppTheme.amberWarning;
        label = 'RETURNED';
        icon = Icons.assignment_return_outlined;
        break;
      case 'REJECTED':
      case 'FAILED':
      case 'FAIL':
      case 'EXPIRED':
        bg = AppTheme.roseLight;
        fg = AppTheme.roseError;
        label = normalized == 'EXPIRED' ? 'EXPIRED' : 'FAILED';
        icon = Icons.error_outline;
        break;
      default:
        bg = AppTheme.slate100;
        fg = AppTheme.slate700;
        label = normalized.isEmpty ? 'UNKNOWN' : normalized;
        icon = Icons.info_outline;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 6 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: fg.withValues(alpha: 0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isSmall ? 12 : 14, color: fg),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: fg,
                fontSize: isSmall ? 10 : 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
