import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/inspection_model.dart';
import '../models/officer_model.dart';
import '../services/api_client.dart';

class AppState extends ChangeNotifier {
  static const _accessTokenKey = 'metrix_lmo_access_token';
  static const _refreshTokenKey = 'metrix_lmo_refresh_token';
  static const _expiresAtKey = 'metrix_lmo_expires_at';

  final MetrixApiClient _api = const MetrixApiClient();

  OfficerModel? _officer;
  List<InspectionModel> _inspections = [];
  bool _isLoading = false;
  bool _isRestoringSession = false;
  String _filterStatus = 'ALL';
  String _searchQuery = '';
  String? _accessToken;
  DateTime? _expiresAt;
  String? _errorMessage;

  OfficerModel get officer => _officer ?? OfficerModel.defaultOfficer();
  List<InspectionModel> get inspections => _inspections;
  bool get isLoading => _isLoading;
  bool get isRestoringSession => _isRestoringSession;
  bool get isAuthenticated => _accessToken != null && _officer != null;
  String get filterStatus => _filterStatus;
  String get searchQuery => _searchQuery;
  String? get errorMessage => _errorMessage;

  int get assignedCount => _inspections
      .where((inspection) =>
          inspection.status == 'ASSIGNED' ||
          inspection.status == 'SCHEDULED' ||
          inspection.status == 'RETURNED')
      .length;

  int get inProgressCount =>
      _inspections.where((inspection) => inspection.isInProgress).length;

  int get submittedCount =>
      _inspections.where((inspection) => inspection.isSubmitted).length;

  List<InspectionModel> get filteredInspections {
    return _inspections.where((inspection) {
      final query = _searchQuery.toLowerCase().trim();
      final matchesSearch = query.isEmpty ||
          inspection.id.toLowerCase().contains(query) ||
          inspection.applicationId.toLowerCase().contains(query) ||
          inspection.instrumentName.toLowerCase().contains(query) ||
          inspection.serialNumber.toLowerCase().contains(query) ||
          inspection.ownerName.toLowerCase().contains(query);

      final matchesFilter = switch (_filterStatus) {
        'ASSIGNED' => inspection.status == 'ASSIGNED' ||
            inspection.status == 'SCHEDULED' ||
            inspection.status == 'RETURNED',
        'IN_PROGRESS' => inspection.isInProgress,
        'SUBMITTED' => inspection.isSubmitted,
        _ => true,
      };

      return matchesSearch && matchesFilter;
    }).toList();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    try {
      final session = await _api.signInWithPassword(
        email: email,
        password: password,
      );
      await _activateSession(session);
      await loadInspections();
    } catch (error) {
      await logout(notify: false);
      _errorMessage = _messageFor(error);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> restoreSession() async {
    if (_isRestoringSession || isAuthenticated) return isAuthenticated;
    _isRestoringSession = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_accessTokenKey);
      final refreshToken = prefs.getString(_refreshTokenKey);
      final expiresAtRaw = prefs.getString(_expiresAtKey);

      if (token == null || token.isEmpty) return false;

      _accessToken = token;
      _expiresAt = DateTime.tryParse(expiresAtRaw ?? '');

      if (_expiresAt != null &&
          _expiresAt!
              .isBefore(DateTime.now().add(const Duration(minutes: 2))) &&
          refreshToken != null &&
          refreshToken.isNotEmpty) {
        final refreshed = await _api.refreshSession(refreshToken);
        await _saveSession(refreshed);
      }

      final profile = await _api.getProfile(_requireToken());
      _assertLmo(profile);
      _officer = OfficerModel.fromProfile(profile);
      await loadInspections();
      return true;
    } catch (error) {
      await logout(notify: false);
      _errorMessage = _messageFor(error);
      return false;
    } finally {
      _isRestoringSession = false;
      notifyListeners();
    }
  }

  Future<void> loadInspections() async {
    final token = _requireToken();
    _setLoading(true);
    try {
      final rows = await _api.getInspections(token);
      _inspections = rows.map(InspectionModel.fromApi).toList();
      _errorMessage = null;
    } catch (error) {
      _errorMessage = _messageFor(error);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshData() async {
    await loadInspections();
  }

  Future<void> startInspection(String inspectionId) async {
    _setLoading(true);
    try {
      await _api.startInspection(
        accessToken: _requireToken(),
        inspectionId: inspectionId,
      );
      await loadInspections();
    } catch (error) {
      _errorMessage = _messageFor(error);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<Map<String, dynamic>> uploadInspectionEvidence({
    required String fileName,
    required String mimeType,
    required String base64,
  }) async {
    try {
      return await _api.uploadDocument(
        accessToken: _requireToken(),
        bucket: 'inspection-evidence',
        fileName: fileName,
        mimeType: mimeType,
        base64: base64,
      );
    } catch (error) {
      _errorMessage = _messageFor(error);
      notifyListeners();
      rethrow;
    }
  }

  Future<void> submitInspection({
    required String inspectionId,
    required List<MeasurementItem> measurements,
    required Map<String, bool> checklist,
    required List<String> evidenceDocumentIds,
    required String remarks,
  }) async {
    _setLoading(true);
    try {
      await _api.submitInspection(
        accessToken: _requireToken(),
        inspectionId: inspectionId,
        payload: {
          'inspectionDate': DateTime.now().toIso8601String().split('T').first,
          'officerRemarks': remarks.trim(),
          'measurements': measurements
              .map((measurement) => measurement.toApiPayload())
              .toList(),
          'checklist': checklist,
          'evidenceDocumentIds': evidenceDocumentIds,
        },
      );
      await loadInspections();
    } catch (error) {
      _errorMessage = _messageFor(error);
      rethrow;
    } finally {
      _setLoading(false);
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

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> logout({bool notify = true}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_expiresAtKey);

    _accessToken = null;
    _expiresAt = null;
    _officer = null;
    _inspections = [];
    _filterStatus = 'ALL';
    _searchQuery = '';
    _errorMessage = null;

    if (notify) notifyListeners();
  }

  Future<void> _activateSession(AuthSession session) async {
    await _saveSession(session);
    final profile = await _api.getProfile(session.accessToken);
    _assertLmo(profile);
    _officer = OfficerModel.fromProfile(profile);
  }

  Future<void> _saveSession(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, session.accessToken);
    await prefs.setString(_refreshTokenKey, session.refreshToken);
    await prefs.setString(_expiresAtKey, session.expiresAt.toIso8601String());

    _accessToken = session.accessToken;
    _expiresAt = session.expiresAt;
  }

  void _assertLmo(Map<String, dynamic> profile) {
    final role = profile['role']?.toString().toUpperCase();
    if (role != 'LMO') {
      throw const ApiException(
          'Only LMO accounts can use the mobile field portal.');
    }
  }

  String _requireToken() {
    final token = _accessToken;
    if (token == null || token.isEmpty) {
      throw const ApiException('LMO session is missing. Please sign in again.');
    }
    return token;
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  String _messageFor(Object error) {
    if (error is ApiException) return error.message;
    return error.toString().replaceFirst('Exception: ', '');
  }
}
