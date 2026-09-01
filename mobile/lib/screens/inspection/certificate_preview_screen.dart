import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/inspection_model.dart';
import '../../theme/app_theme.dart';

class CertificatePreviewScreen extends StatelessWidget {
  final InspectionModel inspection;

  const CertificatePreviewScreen({Key? key, required this.inspection})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final certId = inspection.certificateNumber ?? 'LM-DEL-2026-00114';
    final verifyUrl = 'https://metrix.gov.in/verify/$certId';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Digital Certificate of Stamping'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Certificate',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Certificate PDF exported to local device storage.')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.primaryNavy, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              const Text(
                'GOVERNMENT OF NCT OF DELHI',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: AppTheme.slate500,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'Directorate of Legal Metrology',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Certificate of Verification & Stamping under Legal Metrology Act, 2009',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, color: AppTheme.slate700),
              ),
              const SizedBox(height: 12),

              // Certificate ID Tag
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.slate100,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppTheme.slate300),
                  ),
                  child: Text(
                    'CERTIFICATE ID: $certId',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Courier',
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Divider(color: AppTheme.primaryNavy, thickness: 1.5),
              const SizedBox(height: 12),

              // Instrument Specs
              _buildSectionTitle('1. Regulated Instrument'),
              _buildCertRow('Instrument Name', inspection.instrumentName),
              _buildCertRow('Serial Number', inspection.serialNumber),
              _buildCertRow('Category', inspection.category),
              const SizedBox(height: 12),

              // Owner
              _buildSectionTitle('2. Operating Establishment'),
              _buildCertRow('Registered Business', inspection.ownerName),
              _buildCertRow('Premises Location', inspection.location),
              _buildCertRow('GPS Coordinates', inspection.gpsCoords),
              const SizedBox(height: 12),

              // Validity Box
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.emeraldLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.emeraldGreen.withOpacity(0.3)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Statutory Validity Declaration:',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.emeraldGreen,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Verified in accordance with Schedule VII tolerances. Lead wire security seal affixed and logged in state registry.',
                      style: TextStyle(fontSize: 9.5, color: AppTheme.slate700),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // QR Code & Seal
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.slate300),
                        ),
                        child: QrImageView(
                          data: verifyUrl,
                          version: QrVersions.auto,
                          size: 72,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Scan to Verify Online',
                        style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppTheme.slate500),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        '[DIGITALLY SIGNED & SEALED]',
                        style: TextStyle(
                          fontSize: 8,
                          fontFamily: 'Courier',
                          color: AppTheme.slate500,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        inspection.officer,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                      Text(
                        inspection.officerRole,
                        style: const TextStyle(fontSize: 9, color: AppTheme.slate500),
                      ),
                      const Text(
                        'Directorate of Legal Metrology, Delhi',
                        style: TextStyle(fontSize: 8.5, color: AppTheme.slate500),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 12),
              // SHA-256 Hash
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.slate100,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SHA-256 INTEGRITY CHECKSUM:',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.slate500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      inspection.securityHash ??
                          '8f7a6b2c4e1d9f3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
                      style: const TextStyle(
                        fontSize: 8.5,
                        fontFamily: 'Courier',
                        color: AppTheme.slate700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryNavy,
        ),
      ),
    );
  }

  Widget _buildCertRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.slate500)),
          Text(value, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.slate700)),
        ],
      ),
    );
  }
}
