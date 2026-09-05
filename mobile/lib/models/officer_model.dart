class OfficerModel {
  final String badgeId;
  final String name;
  final String designation;
  final String zone;
  final String email;
  final String phone;
  final int totalInspections;
  final int pendingSync;

  OfficerModel({
    required this.badgeId,
    required this.name,
    required this.designation,
    required this.zone,
    required this.email,
    required this.phone,
    required this.totalInspections,
    required this.pendingSync,
  });

  factory OfficerModel.defaultOfficer() {
    return OfficerModel(
      badgeId: 'LMO-AJM-021',
      name: 'Rajesh Kumar',
      designation: 'Legal Metrology Officer',
      zone: 'Ajmer City & Krishi Mandi Commercial Zone',
      email: 'rajesh.kumar@lmo.raj.gov.in',
      phone: '+91 94140 12345',
      totalInspections: 142,
      pendingSync: 2,
    );
  }
}
