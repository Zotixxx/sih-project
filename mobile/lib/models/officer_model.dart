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
      badgeId: 'LMO-104-DL',
      name: 'Inspector Rajesh Sharma',
      designation: 'Senior Legal Metrology Officer',
      zone: 'South & South-East Delhi Enforcement Zone',
      email: 'rajesh.sharma@metrix.gov.in',
      phone: '+91 98101 23456',
      totalInspections: 142,
      pendingSync: 2,
    );
  }
}
