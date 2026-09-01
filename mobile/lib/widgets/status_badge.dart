import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool isSmall;

  const StatusBadge({
    Key? key,
    required this.status,
    this.isSmall = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;
    IconData icon;

    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'PASSED':
      case 'VALID':
        bg = AppTheme.emeraldLight;
        fg = AppTheme.emeraldGreen;
        label = 'VERIFIED (PASS)';
        icon = Icons.verified_outlined;
        break;
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        bg = AppTheme.amberLight;
        fg = AppTheme.amberWarning;
        label = status == 'IN_PROGRESS' ? 'IN PROGRESS' : 'SCHEDULED';
        icon = Icons.schedule_outlined;
        break;
      case 'UNSYNCED':
      case 'SYNC_PENDING':
        bg = AppTheme.blueLight;
        fg = AppTheme.blueInfo;
        label = 'OFFLINE CACHED';
        icon = Icons.cloud_off_outlined;
        break;
      case 'REJECTED':
      case 'EXPIRED':
        bg = AppTheme.roseLight;
        fg = AppTheme.roseError;
        label = 'FAILED';
        icon = Icons.error_outline;
        break;
      default:
        bg = AppTheme.slate100;
        fg = AppTheme.slate700;
        label = status;
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
        border: Border.all(color: fg.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isSmall ? 12 : 14, color: fg),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: isSmall ? 10 : 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
