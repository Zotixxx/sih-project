import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';

class SyncQueueScreen extends StatefulWidget {
  const SyncQueueScreen({Key? key}) : super(key: key);

  @override
  State<SyncQueueScreen> createState() => _SyncQueueScreenState();
}

class _SyncQueueScreenState extends State<SyncQueueScreen> {
  bool _isSyncing = false;
  String _syncMessage = '';

  void _triggerSync(AppState state) async {
    setState(() {
      _isSyncing = true;
      _syncMessage = 'Initiating cloud sync...';
    });

    await state.syncAllPending(onProgress: (msg) {
      if (mounted) {
        setState(() => _syncMessage = msg);
      }
    });

    if (mounted) {
      setState(() => _isSyncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✓ All offline records successfully synced to central MetriX database!'),
          backgroundColor: AppTheme.emeraldGreen,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final inspections = state.inspections;
    final unsynced = inspections.where((i) => !i.isSynced).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Offline Sync Manager'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Sync Status Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Local Cache & Network Queue',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryNavy,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          state.isOnline
                              ? 'Connected to Central Enforcement Hub'
                              : 'Offline (Local SQLite Cache Active)',
                          style: TextStyle(
                            fontSize: 11,
                            color: state.isOnline ? AppTheme.emeraldGreen : AppTheme.roseError,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Icon(
                      state.isOnline ? Icons.cloud_done : Icons.cloud_off,
                      color: state.isOnline ? AppTheme.emeraldGreen : AppTheme.roseError,
                      size: 28,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 12),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem('Total Records', inspections.length.toString()),
                    _buildStatItem('Pending Sync', unsynced.length.toString(), color: AppTheme.amberWarning),
                    _buildStatItem('Synced to Cloud', (inspections.length - unsynced.length).toString(), color: AppTheme.emeraldGreen),
                  ],
                ),
                const SizedBox(height: 16),

                if (_isSyncing) ...[
                  LinearProgressIndicator(
                    backgroundColor: AppTheme.slate100,
                    color: AppTheme.primaryNavy,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _syncMessage,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
                  ),
                  const SizedBox(height: 8),
                ],

                ElevatedButton.icon(
                  onPressed: _isSyncing ? null : () => _triggerSync(state),
                  icon: const Icon(Icons.sync, size: 18),
                  label: Text(_isSyncing ? 'Synchronizing Records...' : 'Synchronize All Records Now'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Queue List
          const Text(
            'Inspection Records Queue',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 8),

          ...inspections.map((insp) {
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(
                  insp.instrumentName,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                ),
                subtitle: Text(
                  '${insp.id} • ${insp.serialNumber}\nUpdated: ${insp.updatedAt.split("T")[0]}',
                  style: const TextStyle(fontSize: 10, color: AppTheme.slate500),
                ),
                trailing: StatusBadge(
                  status: insp.isSynced ? 'VALID' : 'UNSYNCED',
                  isSmall: true,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, {Color? color}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color ?? AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: AppTheme.slate500),
        ),
      ],
    );
  }
}
