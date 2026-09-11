class OfficerModel {
  final String userId;
  final String badgeId;
  final String name;
  final String designation;
  final String zone;
  final String districtId;
  final String email;
  final String phone;

  const OfficerModel({
    required this.userId,
    required this.badgeId,
    required this.name,
    required this.designation,
    required this.zone,
    required this.districtId,
    required this.email,
    required this.phone,
  });

  factory OfficerModel.defaultOfficer() {
    return const OfficerModel(
      userId: '',
      badgeId: '',
      name: 'Signed-in LMO',
      designation: 'Legal Metrology Officer',
      zone: '',
      districtId: '',
      email: '',
      phone: '',
    );
  }

  factory OfficerModel.fromProfile(Map<String, dynamic> profile) {
    final domainId = profile['domainId'] ??
        profile['lmo_id'] ??
        profile['officerId'] ??
        profile['badgeNumber'] ??
        '';

    return OfficerModel(
      userId: profile['id']?.toString() ??
          profile['user_id']?.toString() ??
          profile['auth_user_id']?.toString() ??
          '',
      badgeId: domainId.toString(),
      name: profile['name']?.toString() ??
          profile['displayName']?.toString() ??
          'Legal Metrology Officer',
      designation:
          profile['designation']?.toString() ?? 'Legal Metrology Officer',
      zone: profile['jurisdiction']?.toString() ??
          profile['district_id']?.toString() ??
          '',
      districtId: profile['district_id']?.toString() ?? '',
      email: profile['email']?.toString() ?? '',
      phone: profile['phone']?.toString() ?? '',
    );
  }
}
