import 'dart:async';
import 'database_helper.dart';
import '../models/inspection_model.dart';

class SyncManager {
  static final SyncManager instance = SyncManager._init();
  bool _isSyncing = false;
  bool get isSyncing => _isSyncing;

  SyncManager._init();

  Future<int> getPendingSyncCount() async {
    final unsynced = await DatabaseHelper.instance.getUnsyncedInspections();
    return unsynced.length;
  }

  Future<bool> syncAllPending({Function(String message)? onProgress}) async {
    if (_isSyncing) return false;
    _isSyncing = true;

    try {
      final unsynced = await DatabaseHelper.instance.getUnsyncedInspections();
      if (unsynced.isEmpty) {
        onProgress?.call('All inspections are already synchronized.');
        _isSyncing = false;
        return true;
      }

      onProgress?.call('Syncing ${unsynced.length} offline records with central server...');

      for (var insp in unsynced) {
        // Simulate network upload delay with Express/Supabase backend
        await Future.delayed(const Duration(milliseconds: 800));
        await DatabaseHelper.instance.markAsSynced(insp.id);
        onProgress?.call('Synced ${insp.id} (${insp.instrumentName})');
      }

      onProgress?.call('Sync completed successfully!');
      _isSyncing = false;
      return true;
    } catch (e) {
      onProgress?.call('Sync failed: $e');
      _isSyncing = false;
      return false;
    }
  }
}
