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
        id: map['id'] ?? '',
        label: map['label'] ?? '',
        passed: map['passed'] == 1 || map['passed'] == true,
      );
}

class MeasurementItem {
  final String testLoad;
  final String observed;
  final String mpe;
  final String result;

  MeasurementItem({
    required this.testLoad,
    required this.observed,
    required this.mpe,
    required this.result,
  });

  Map<String, dynamic> toMap() => {
        'testLoad': testLoad,
        'observed': observed,
        'mpe': mpe,
        'result': result,
      };

  factory MeasurementItem.fromMap(Map<String, dynamic> map) => MeasurementItem(
        testLoad: map['testLoad'] ?? '',
        observed: map['observed'] ?? '',
        mpe: map['mpe'] ?? '',
        result: map['result'] ?? 'PASS',
      );
}

class InspectionModel {
  final String id;
  final String applicationId;
  final String instrumentId;
  final String instrumentName;
  final String serialNumber;
  final String category;
  final String ownerName;
  final String location;
  final String district;
  final String scheduledDate;
  final String scheduledTime;
  final String officer;
  final String officerRole;
  String status; // 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  String gpsCoords;
  String remarks;
  List<ChecklistItem> checklistItems;
  List<MeasurementItem> measurements;
  List<String> photos;
  String? certificateNumber;
  String? securityHash;
  bool isSynced;
  String updatedAt;

  InspectionModel({
    required this.id,
    required this.applicationId,
    required this.instrumentId,
    required this.instrumentName,
    required this.serialNumber,
    required this.category,
    required this.ownerName,
    required this.location,
    required this.district,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.officer,
    required this.officerRole,
    this.status = 'SCHEDULED',
    this.gpsCoords = '28.5355° N, 77.2625° E',
    this.remarks = '',
    required this.checklistItems,
    required this.measurements,
    required this.photos,
    this.certificateNumber,
    this.securityHash,
    this.isSynced = false,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'applicationId': applicationId,
      'instrumentId': instrumentId,
      'instrumentName': instrumentName,
      'serialNumber': serialNumber,
      'category': category,
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
      'checklistItems': jsonEncode(checklistItems.map((e) => e.toMap()).toList()),
      'measurements': jsonEncode(measurements.map((e) => e.toMap()).toList()),
      'photos': jsonEncode(photos),
      'certificateNumber': certificateNumber,
      'securityHash': securityHash,
      'isSynced': isSynced ? 1 : 0,
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
        checklist = decoded.map((e) => ChecklistItem.fromMap(e)).toList();
      }
    }

    List<MeasurementItem> meas = [];
    if (map['measurements'] != null) {
      final decoded = map['measurements'] is String
          ? jsonDecode(map['measurements'])
          : map['measurements'];
      if (decoded is List) {
        meas = decoded.map((e) => MeasurementItem.fromMap(e)).toList();
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
      id: map['id'] ?? '',
      applicationId: map['applicationId'] ?? '',
      instrumentId: map['instrumentId'] ?? '',
      instrumentName: map['instrumentName'] ?? '',
      serialNumber: map['serialNumber'] ?? '',
      category: map['category'] ?? '',
      ownerName: map['ownerName'] ?? '',
      location: map['location'] ?? '',
      district: map['district'] ?? '',
      scheduledDate: map['scheduledDate'] ?? '',
      scheduledTime: map['scheduledTime'] ?? '',
      officer: map['officer'] ?? '',
      officerRole: map['officerRole'] ?? '',
      status: map['status'] ?? 'SCHEDULED',
      gpsCoords: map['gpsCoords'] ?? '28.5355° N, 77.2625° E',
      remarks: map['remarks'] ?? '',
      checklistItems: checklist,
      measurements: meas,
      photos: photoList,
      certificateNumber: map['certificateNumber'],
      securityHash: map['securityHash'],
      isSynced: map['isSynced'] == 1 || map['isSynced'] == true,
      updatedAt: map['updatedAt'] ?? DateTime.now().toIso8601String(),
    );
  }
}
