import 'dart:convert';
import 'package:crypto/crypto.dart';

class CryptoService {
  static String generateCertificateHash({
    required String certificateNumber,
    required String instrumentId,
    required String serialNumber,
    required String officerBadge,
    required String timestamp,
  }) {
    final payload = '$certificateNumber|$instrumentId|$serialNumber|$officerBadge|$timestamp|LEGAL_METROLOGY_DELHI_2026';
    final bytes = utf8.encode(payload);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  static String generateSealNumber(String officerBadge) {
    final now = DateTime.now();
    final randomSuffix = (now.millisecondsSinceEpoch % 9000 + 1000).toString();
    return 'SEAL-DL-${now.year}-$randomSuffix';
  }
}
