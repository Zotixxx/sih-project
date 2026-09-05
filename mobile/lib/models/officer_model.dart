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
      badgeId: '',
      name: 'Signed-in LMO',
      designation: 'Legal Metrology Officer',
      zone: '',
      email: '',
      phone: '',
      totalInspections: 0,
      pendingSync: 0,
    );
  }
}
