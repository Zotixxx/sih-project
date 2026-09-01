class InstrumentModel {
  final String id;
  final String name;
  final String category;
  final String manufacturer;
  final String model;
  final String serialNumber;
  final String accuracyClass;
  final String maxCapacity;
  final String minCapacity;
  final String verificationScaleInterval;
  final String ownerName;
  final String tradeName;
  final String location;
  final String district;
  final String? certificateId;
  final String? validUntil;

  InstrumentModel({
    required this.id,
    required this.name,
    required this.category,
    required this.manufacturer,
    required this.model,
    required this.serialNumber,
    required this.accuracyClass,
    required this.maxCapacity,
    required this.minCapacity,
    required this.verificationScaleInterval,
    required this.ownerName,
    required this.tradeName,
    required this.location,
    required this.district,
    this.certificateId,
    this.validUntil,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'manufacturer': manufacturer,
      'model': model,
      'serialNumber': serialNumber,
      'accuracyClass': accuracyClass,
      'maxCapacity': maxCapacity,
      'minCapacity': minCapacity,
      'verificationScaleInterval': verificationScaleInterval,
      'ownerName': ownerName,
      'tradeName': tradeName,
      'location': location,
      'district': district,
      'certificateId': certificateId,
      'validUntil': validUntil,
    };
  }

  factory InstrumentModel.fromMap(Map<String, dynamic> map) {
    return InstrumentModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      category: map['category'] ?? '',
      manufacturer: map['manufacturer'] ?? '',
      model: map['model'] ?? '',
      serialNumber: map['serialNumber'] ?? '',
      accuracyClass: map['accuracyClass'] ?? '',
      maxCapacity: map['maxCapacity'] ?? '',
      minCapacity: map['minCapacity'] ?? '',
      verificationScaleInterval: map['verificationScaleInterval'] ?? '',
      ownerName: map['ownerName'] ?? '',
      tradeName: map['tradeName'] ?? '',
      location: map['location'] ?? '',
      district: map['district'] ?? '',
      certificateId: map['certificateId'],
      validUntil: map['validUntil'],
    );
  }
}
