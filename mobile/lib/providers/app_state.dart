import 'package:flutter/material.dart';
import '../models/inspection_model.dart';
import '../models/officer_model.dart';
import '../services/database_helper.dart';
import '../services/sync_manager.dart';

class AppState extends ChangeNotifier {
  OfficerModel _officer = OfficerModel.defaultOfficer();
  List<InspectionModel> _inspections = [];
  bool _isLoading = false;
  bool _isOnline = true;
  String _filterStatus = 'ALL'; // 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'UNSYNCED'
  String _searchQuery = '';

  OfficerModel get officer => _officer;
  List<InspectionModel> get inspections => _inspections;
  bool get isLoading => _isLoading;
  bool get isOnline => _isOnline;
  String get filterStatus => _filterStatus;
  String get searchQuery => _searchQuery;

  int get scheduledCount =>
      _inspections.where((i) => i.status == 'SCHEDULED').length;
  int get completedCount =>
      _inspections.where((i) => i.status == 'COMPLETED').length;
  int get unsyncedCount =>
      _inspections.where((i) => !i.isSynced).length;

  List<InspectionModel> get filteredInspections {
    return _inspections.where((insp) {
      final matchesSearch = _searchQuery.isEmpty ||
          insp.instrumentName
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()) ||
          insp.id.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          insp.serialNumber.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          insp.ownerName.toLowerCase().contains(_searchQuery.toLowerCase());

      final matchesFilter = _filterStatus == 'ALL' ||
          (_filterStatus == 'SCHEDULED' && insp.status == 'SCHEDULED') ||
          (_filterStatus == 'COMPLETED' && insp.status == 'COMPLETED') ||
          (_filterStatus == 'UNSYNCED' && !insp.isSynced);

      return matchesSearch && matchesFilter;
    }).toList();
  }

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    try {
      _inspections = await DatabaseHelper.instance.getAllInspections();
    } catch (e) {
      debugPrint('Error loading inspections: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setFilterStatus(String status) {
    _filterStatus = status;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void toggleOnlineOffline() {
    _isOnline = !_isOnline;
    notifyListeners();
  }

  Future<void> toggleChecklistItem(String inspId, String itemId) async {
    final index = _inspections.indexWhere((i) => i.id == inspId);
    if (index != -1) {
      final insp = _inspections[index];
      final itemIndex = insp.checklistItems.indexWhere((c) => c.id == itemId);
      if (itemIndex != -1) {
        insp.checklistItems[itemIndex].passed =
            !insp.checklistItems[itemIndex].passed;
        insp.updatedAt = DateTime.now().toIso8601String();
        insp.isSynced = false;
        await DatabaseHelper.instance.updateInspection(insp);
        notifyListeners();
      }
    }
  }

  Future<void> updateMeasurement(
      String inspId, int index, String observed) async {
    final inspIndex = _inspections.indexWhere((i) => i.id == inspId);
    if (inspIndex != -1) {
      final insp = _inspections[inspIndex];
      if (index >= 0 && index < insp.measurements.length) {
        final m = insp.measurements[index];
        insp.measurements[index] = MeasurementItem(
          testLoad: m.testLoad,
          observed: observed,
          mpe: m.mpe,
          result: 'PASS',
        );
        insp.updatedAt = DateTime.now().toIso8601String();
        insp.isSynced = false;
        await DatabaseHelper.instance.updateInspection(insp);
        notifyListeners();
      }
    }
  }

  Future<void> addPhoto(String inspId, String photoName) async {
    final index = _inspections.indexWhere((i) => i.id == inspId);
    if (index != -1) {
      final insp = _inspections[index];
      insp.photos.add(photoName);
      insp.updatedAt = DateTime.now().toIso8601String();
      insp.isSynced = false;
      await DatabaseHelper.instance.updateInspection(insp);
      notifyListeners();
    }
  }

  Future<void> updateGpsCoords(String inspId, String coords) async {
    final index = _inspections.indexWhere((i) => i.id == inspId);
    if (index != -1) {
      final insp = _inspections[index];
      insp.gpsCoords = coords;
      insp.updatedAt = DateTime.now().toIso8601String();
      insp.isSynced = false;
      await DatabaseHelper.instance.updateInspection(insp);
      notifyListeners();
    }
  }

  Future<void> completeInspection({
    required String inspId,
    required String remarks,
    required bool isPass,
  }) async {
    final index = _inspections.indexWhere((i) => i.id == inspId);
    if (index != -1) {
      final insp = _inspections[index];
      insp.remarks = remarks;
      insp.status = isPass ? 'COMPLETED' : 'REJECTED';

      insp.updatedAt = DateTime.now().toIso8601String();
      insp.isSynced = false;

      await DatabaseHelper.instance.updateInspection(insp);
      notifyListeners();
    }
  }

  Future<void> syncAllPending({Function(String message)? onProgress}) async {
    await SyncManager.instance.syncAllPending(onProgress: onProgress);
    await init();
  }
}
