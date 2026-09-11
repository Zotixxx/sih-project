import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/app_state.dart';
import '../../services/api_client.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';

class OfficerProfileScreen extends StatelessWidget {
  const OfficerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final officer = state.officer;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Officer Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.primaryNavy,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white.withValues(alpha: 0.1),
                  child:
                      const Icon(Icons.person, size: 36, color: Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        officer.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        officer.designation,
                        style: const TextStyle(
                            fontSize: 11, color: AppTheme.slate300),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'ID: ${officer.badgeId.isEmpty ? 'LMO' : officer.badgeId}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Courier',
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Jurisdiction',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildProfileRow('District', officer.districtId),
                  _buildProfileRow('Jurisdiction', officer.zone),
                  _buildProfileRow('Official Email', officer.email),
                  _buildProfileRow('Contact Phone', officer.phone),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Mobile Portal',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildProfileRow('Mode', 'Online LMO portal'),
                  _buildProfileRow('API', AppConfig.apiBaseUrl),
                  _buildProfileRow(
                      'Assigned Inspections', '${state.inspections.length}'),
                  _buildProfileRow(
                      'Submitted Records', '${state.submittedCount}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.roseError,
              side: const BorderSide(color: AppTheme.roseError),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () async {
              await context.read<AppState>().logout();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
            icon: const Icon(Icons.logout, size: 18),
            label: const Text('Logout Officer Session'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 118,
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
            ),
          ),
          Expanded(
            child: Text(
              value.isEmpty ? 'Not recorded' : value,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppTheme.slate700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
