import 'dart:convert';

class ChecklistItem {
  final String id;
  final String label;
  bool passed;

  ChecklistItem({
    required this.id,
    required this.label,
    this.passed = false,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'label': label,
        'passed': passed,
      };

  factory ChecklistItem.fromMap(Map<String, dynamic> map) => ChecklistItem(
        id: map['id']?.toString() ?? '',
        label: map['label']?.toString() ?? '',
        passed: map['passed'] == true ||
            map['passed'] == 1 ||
            map['status']?.toString().toUpperCase() == 'PASS',
      );
}

class MeasurementItem {
  final String testLoad;
  final String observed;
  final String mpe;
  final String error;
  final String result;

  const MeasurementItem({
    required this.testLoad,
    required this.observed,
    required this.mpe,
    this.error = '',
    this.result = 'PASS',
  });

  Map<String, dynamic> toMap() => {
        'testLoad': testLoad,
        'observed': observed,
        'mpe': mpe,
        'error': error,
        'result': result,
      };

  Map<String, dynamic> toApiPayload() => {
        'testLoad': testLoad.trim(),
        'indicatedWeight': observed.trim(),
        'mpeLimit': mpe.trim(),
      };

  factory MeasurementItem.fromMap(Map<String, dynamic> map) => MeasurementItem(
        testLoad: map['testLoad']?.toString() ??
            map['test_load']?.toString() ??
            map['nominalLoad']?.toString() ??
            '',
        observed: map['observed']?.toString() ??
            map['indicatedWeight']?.toString() ??
            map['indicated_weight']?.toString() ??
            '',
        mpe: map['mpe']?.toString() ??
            map['mpeLimit']?.toString() ??
            map['mpe_limit']?.toString() ??
            '',
        error: map['error']?.toString() ?? '',
        result: map['result']?.toString() ?? 'PASS',
      );
}

class EvidenceItem {
  final String documentId;
  final String fileName;

  const EvidenceItem({
    required this.documentId,
    required this.fileName,
  });

  factory EvidenceItem.fromMap(Map<String, dynamic> map) => EvidenceItem(
        documentId:
            map['documentId']?.toString() ?? map['id']?.toString() ?? '',
        fileName: map['fileName']?.toString() ??
            map['originalName']?.toString() ??
            map['original_name']?.toString() ??
            'Evidence file',
      );
}

class InspectionModel {
  final String id;
  final String applicationId;
  final String instrumentId;
  final String instrumentName;
  final String serialNumber;
  final String category;
  final String capacity;
  final String ownerName;
  final String location;
  final String district;
  final String scheduledDate;
  final String scheduledTime;
  final String officer;
  final String officerRole;
  String status;
  String gpsCoords;
  String remarks;
  List<ChecklistItem> checklistItems;
  List<MeasurementItem> measurements;
  List<String> photos;
  List<EvidenceItem> evidence;
  String? certificateNumber;
  String? securityHash;
  bool isSynced;
  String inspectionDate;
  String submittedAt;
  String updatedAt;

  InspectionModel({
    required this.id,
    required this.applicationId,
    required this.instrumentId,
    required this.instrumentName,
    required this.serialNumber,
    required this.category,
    this.capacity = '',
    required this.ownerName,
    required this.location,
    required this.district,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.officer,
    required this.officerRole,
    this.status = 'ASSIGNED',
    this.gpsCoords = '',
    this.remarks = '',
    required this.checklistItems,
    required this.measurements,
    required this.photos,
    this.evidence = const [],
    this.certificateNumber,
    this.securityHash,
    this.isSynced = true,
    this.inspectionDate = '',
    this.submittedAt = '',
    required this.updatedAt,
  });

  bool get isActionable =>
      status == 'ASSIGNED' || status == 'SCHEDULED' || status == 'RETURNED';

  bool get isInProgress =>
      status == 'IN_PROGRESS' || status == 'UNDER_VERIFICATION';

  bool get isSubmitted =>
      status == 'SUBMITTED' ||
      status == 'SUBMITTED_FOR_APPROVAL' ||
      status == 'APPROVED' ||
      status == 'COMPLETED' ||
      status == 'CERTIFIED';

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'applicationId': applicationId,
      'instrumentId': instrumentId,
      'instrumentName': instrumentName,
      'serialNumber': serialNumber,
      'category': category,
      'capacity': capacity,
      'ownerName': ownerName,
      'location': location,
      'district': district,
      'scheduledDate': scheduledDate,
      'scheduledTime': scheduledTime,
      'officer': officer,
      'officerRole': officerRole,
      'status': status,
      'gpsCoords': gpsCoords,
      'remarks': remarks,
      'checklistItems':
          jsonEncode(checklistItems.map((e) => e.toMap()).toList()),
      'measurements': jsonEncode(measurements.map((e) => e.toMap()).toList()),
      'photos': jsonEncode(photos),
      'certificateNumber': certificateNumber,
      'securityHash': securityHash,
      'isSynced': isSynced ? 1 : 0,
      'inspectionDate': inspectionDate,
      'submittedAt': submittedAt,
      'updatedAt': updatedAt,
    };
  }

  factory InspectionModel.fromMap(Map<String, dynamic> map) {
    List<ChecklistItem> checklist = [];
    if (map['checklistItems'] != null) {
      final decoded = map['checklistItems'] is String
          ? jsonDecode(map['checklistItems'])
          : map['checklistItems'];
      if (decoded is List) {
        checklist = decoded
            .map((e) =>
                ChecklistItem.fromMap(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
    }

    List<MeasurementItem> meas = [];
    if (map['measurements'] != null) {
      final decoded = map['measurements'] is String
          ? jsonDecode(map['measurements'])
          : map['measurements'];
      if (decoded is List) {
        meas = decoded
            .map((e) =>
                MeasurementItem.fromMap(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
    }

    List<String> photoList = [];
    if (map['photos'] != null) {
      final decoded =
          map['photos'] is String ? jsonDecode(map['photos']) : map['photos'];
      if (decoded is List) {
        photoList = decoded.map((e) => e.toString()).toList();
      }
    }

    return InspectionModel(
      id: map['id']?.toString() ?? '',
      applicationId: map['applicationId']?.toString() ?? '',
      instrumentId: map['instrumentId']?.toString() ?? '',
      instrumentName: map['instrumentName']?.toString() ?? '',
      serialNumber: map['serialNumber']?.toString() ?? '',
      category: map['category']?.toString() ?? '',
      capacity: map['capacity']?.toString() ?? '',
      ownerName: map['ownerName']?.toString() ?? '',
      location: map['location']?.toString() ?? '',
      district: map['district']?.toString() ?? '',
      scheduledDate: map['scheduledDate']?.toString() ?? '',
      scheduledTime: map['scheduledTime']?.toString() ?? '',
      officer: map['officer']?.toString() ?? '',
      officerRole: map['officerRole']?.toString() ?? '',
      status: _normalizeStatus(map['status']),
      gpsCoords: map['gpsCoords']?.toString() ?? '',
      remarks: map['remarks']?.toString() ?? '',
      checklistItems: checklist.isEmpty ? defaultChecklistItems() : checklist,
      measurements: meas,
      photos: photoList,
      certificateNumber: map['certificateNumber']?.toString(),
      securityHash: map['securityHash']?.toString(),
      isSynced: map['isSynced'] == 1 || map['isSynced'] == true,
      inspectionDate: map['inspectionDate']?.toString() ?? '',
      submittedAt: map['submittedAt']?.toString() ?? '',
      updatedAt:
          map['updatedAt']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }

  factory InspectionModel.fromApi(Map<String, dynamic> map) {
    final evidenceRows = _listOfMaps(map['evidence'] ?? map['photos'])
        .map(EvidenceItem.fromMap)
        .where((item) => item.documentId.isNotEmpty)
        .toList();

    final measurements =
        _listOfMaps(map['measurements']).map(MeasurementItem.fromMap).toList();

    return InspectionModel(
      id: map['id']?.toString() ??
          map['inspection_id']?.toString() ??
          map['uuid']?.toString() ??
          '',
      applicationId: map['applicationId']?.toString() ??
          map['application_id']?.toString() ??
          '',
      instrumentId: map['instrumentId']?.toString() ?? '',
      instrumentName: map['instrumentName']?.toString() ?? 'Instrument',
      serialNumber: map['serialNumber']?.toString() ?? '',
      category: map['category']?.toString() ?? 'Weighing Instrument',
      capacity: map['capacity']?.toString() ?? '',
      ownerName: map['ownerName']?.toString() ??
          map['businessName']?.toString() ??
          'Business',
      location: map['location']?.toString() ?? '',
      district:
          map['district']?.toString() ?? map['district_id']?.toString() ?? '',
      scheduledDate: map['scheduledDate']?.toString() ?? '',
      scheduledTime: map['scheduledTime']?.toString() ?? '',
      officer:
          map['officer']?.toString() ?? map['officerName']?.toString() ?? '',
      officerRole: map['officerRole']?.toString() ?? 'Legal Metrology Officer',
      status: _normalizeStatus(map['status']),
      gpsCoords: map['gpsCoords']?.toString() ??
          map['gpsCoordinates']?.toString() ??
          '',
      remarks:
          map['remarks']?.toString() ?? map['officerRemarks']?.toString() ?? '',
      checklistItems: _checklistFromApi(map['checklist']),
      measurements: measurements,
      photos: evidenceRows.map((item) => item.fileName).toList(),
      evidence: evidenceRows,
      certificateNumber: map['certificateNumber']?.toString(),
      securityHash: map['securityHash']?.toString(),
      isSynced: true,
      inspectionDate: map['inspectionDate']?.toString() ?? '',
      submittedAt: map['submittedAt']?.toString() ?? '',
      updatedAt: map['updatedAt']?.toString() ??
          map['createdAt']?.toString() ??
          DateTime.now().toIso8601String(),
    );
  }

  static List<ChecklistItem> defaultChecklistItems() => [
        ChecklistItem(
          id: 'visualInspectionPassed',
          label:
              'Visual plaque, serial number, and manufacturer markings verified',
          passed: true,
        ),
        ChecklistItem(
          id: 'levelingZeroPassed',
          label: 'Leveling and zero-setting verified',
          passed: true,
        ),
        ChecklistItem(
          id: 'stampingPlaqueValid',
          label: 'Stamping plaque and seal provision verified',
          passed: true,
        ),
      ];

  static List<Map<String, dynamic>> _listOfMaps(dynamic value) {
    if (value is! List) return [];
    return value
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  static List<ChecklistItem> _checklistFromApi(dynamic checklist) {
    final defaults = defaultChecklistItems();
    if (checklist is! Map) return defaults;

    final values = Map<String, dynamic>.from(checklist);
    return defaults.map((item) {
      final value = values[item.id];
      return ChecklistItem(
        id: item.id,
        label: item.label,
        passed: value == true || value == 'PASS' || value == 'true',
      );
    }).toList();
  }

  static String _normalizeStatus(dynamic value) {
    final status = value?.toString().trim().toUpperCase();
    return status == null || status.isEmpty ? 'ASSIGNED' : status;
  }
}
