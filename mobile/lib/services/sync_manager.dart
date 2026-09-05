import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'database_helper.dart';

const apiBaseUrl = String.fromEnvironment(
  'METRIX_API_BASE_URL',
  defaultValue: 'http://10.0.2.2:5001/api',
);
const supabaseAccessToken = String.fromEnvironment(
  'METRIX_SUPABASE_ACCESS_TOKEN',
  defaultValue: '',
);

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
      if (supabaseAccessToken.isEmpty) {
        throw Exception('METRIX_SUPABASE_ACCESS_TOKEN is required for authenticated sync.');
      }

      final authHeaders = {
        'Authorization': 'Bearer $supabaseAccessToken',
      };

      for (var insp in unsynced) {
        final startResponse = await http.post(
          Uri.parse('$apiBaseUrl/inspections/${insp.id}/start'),
          headers: authHeaders,
        );
        if (startResponse.statusCode != 200 && startResponse.statusCode != 400) {
          throw Exception('Could not start ${insp.id}: HTTP ${startResponse.statusCode}');
        }

        final submitResponse = await http.post(
          Uri.parse('$apiBaseUrl/inspections/${insp.id}/submit'),
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: jsonEncode({
            'inspectionDate': DateTime.now().toIso8601String().split('T').first,
            'gpsCoordinates': insp.gpsCoords,
            'officerRemarks': insp.remarks,
            'measurements': insp.measurements.map((measurement) => measurement.toMap()).toList(),
            'checklist': {
              for (final item in insp.checklistItems) item.id: item.passed ? 'PASS' : 'FAIL',
            },
          }),
        );
        if (submitResponse.statusCode != 200) {
          throw Exception('Could not submit ${insp.id}: HTTP ${submitResponse.statusCode}');
        }

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
