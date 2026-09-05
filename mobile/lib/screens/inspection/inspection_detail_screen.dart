import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import 'certificate_preview_screen.dart';

class InspectionDetailScreen extends StatefulWidget {
  final String inspectionId;

  const InspectionDetailScreen({Key? key, required this.inspectionId})
      : super(key: key);

  @override
  State<InspectionDetailScreen> createState() => _InspectionDetailScreenState();
}

class _InspectionDetailScreenState extends State<InspectionDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _remarksController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _remarksController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final inspIndex = state.inspections.indexWhere((i) => i.id == widget.inspectionId);

    if (inspIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Inspection')),
        body: const Center(child: Text('Inspection not found.')),
      );
    }

    final insp = state.inspections[inspIndex];
    if (_remarksController.text.isEmpty && insp.remarks.isNotEmpty) {
      _remarksController.text = insp.remarks;
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(insp.id),
            Text(
              insp.instrumentName,
              style: const TextStyle(fontSize: 10, color: AppTheme.slate300),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: StatusBadge(status: insp.status, isSmall: true),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: Colors.white,
          unselectedLabelColor: AppTheme.slate300,
          indicatorColor: AppTheme.emeraldGreen,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: '1. Specs'),
            Tab(text: '2. Checklist'),
            Tab(text: '3. Test Loads'),
            Tab(text: '4. Photos & GPS'),
            Tab(text: '5. Certification'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSpecsTab(insp),
          _buildChecklistTab(state, insp),
          _buildTestLoadsTab(state, insp),
          _buildPhotosGpsTab(state, insp),
          _buildCertificationTab(state, insp),
        ],
      ),
    );
  }

  // TAB 1: Specs
  Widget _buildSpecsTab(insp) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Instrument Specifications',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 12),
                _buildInfoRow('Category', insp.category),
                _buildInfoRow('Serial Number', insp.serialNumber),
                _buildInfoRow('Scheduled Date', '${insp.scheduledDate} at ${insp.scheduledTime}'),
                _buildInfoRow('Application Filing', insp.applicationId),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Premises & Registered Owner',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 12),
                _buildInfoRow('Establishment', insp.ownerName),
                _buildInfoRow('Location', insp.location),
                _buildInfoRow('Jurisdiction', '${insp.district}, NCT of Delhi'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => _tabController.animateTo(1),
          icon: const Icon(Icons.arrow_forward, size: 16),
          label: const Text('Proceed to Statutory Checklist'),
        ),
      ],
    );
  }

  // TAB 2: Checklist
  Widget _buildChecklistTab(AppState state, insp) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Statutory Field Inspection Checklist',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Tap each statutory rule to record on-site pass/fail verification under Legal Metrology Rules 2011.',
          style: TextStyle(fontSize: 11, color: AppTheme.slate500),
        ),
        const SizedBox(height: 12),
        ...insp.checklistItems.map((item) {
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: CheckboxListTile(
              activeColor: AppTheme.emeraldGreen,
              title: Text(
                item.label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
              ),
              subtitle: Text(
                item.passed ? '✓ COMPLIANT & VERIFIED' : 'PENDING ON-SITE CHECK',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: item.passed ? AppTheme.emeraldGreen : AppTheme.amberWarning,
                ),
              ),
              value: item.passed,
              onChanged: (_) {
                state.toggleChecklistItem(insp.id, item.id);
              },
            ),
          );
        }),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => _tabController.animateTo(2),
          icon: const Icon(Icons.arrow_forward, size: 16),
          label: const Text('Proceed to Load Measurements'),
        ),
      ],
    );
  }

  // TAB 3: Test Loads
  Widget _buildTestLoadsTab(AppState state, insp) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Standard Test Load Error Measurements',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryNavy,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Compare observed readings against standard test weights to calculate MPE compliance.',
          style: TextStyle(fontSize: 11, color: AppTheme.slate500),
        ),
        const SizedBox(height: 12),
        ...List.generate(insp.measurements.length, (index) {
          final m = insp.measurements[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Standard Mass: ${m.testLoad}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.emeraldLight,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppTheme.emeraldGreen.withOpacity(0.3)),
                        ),
                        child: Text(
                          'MPE: ${m.mpe}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.emeraldGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    initialValue: m.observed,
                    keyboardType: TextInputType.text,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(
                      labelText: 'Observed Reading on Scale',
                      labelStyle: TextStyle(fontSize: 11),
                      prefixIcon: Icon(Icons.scale_outlined, size: 18),
                    ),
                    onChanged: (val) {
                      state.updateMeasurement(insp.id, index, val);
                    },
                  ),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => _tabController.animateTo(3),
          icon: const Icon(Icons.arrow_forward, size: 16),
          label: const Text('Proceed to Photo & GPS Evidence'),
        ),
      ],
    );
  }

  // TAB 4: Photos & GPS
  Widget _buildPhotosGpsTab(AppState state, insp) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // GPS Geotag Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.gps_fixed, color: AppTheme.emeraldGreen, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'GPS Presence Geotag Verification',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryNavy,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Statutory requirement guarantees the inspector is physically present at the operating premises.',
                  style: TextStyle(fontSize: 11, color: AppTheme.slate500),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.slate100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Recorded GPS Stamp:',
                            style: TextStyle(fontSize: 10, color: AppTheme.slate500),
                          ),
                          Text(
                            insp.gpsCoords,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Courier',
                              color: AppTheme.primaryNavy,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.refresh, color: AppTheme.primaryNavy),
                        tooltip: 'Recalculate GPS',
                        onPressed: () {
                          state.updateGpsCoords(insp.id, '28.5289° N, 77.2790° E (Acquired)');
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('GPS coordinates refreshed from device hardware.')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Photo Evidence
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Photographic Evidence',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryNavy,
                      ),
                    ),
                    TextButton.icon(
                      onPressed: () {
                        final photoName = 'Evidence_Photo_${DateTime.now().millisecondsSinceEpoch % 1000}.jpg';
                        state.addPhoto(insp.id, photoName);
                      },
                      icon: const Icon(Icons.camera_alt_outlined, size: 16),
                      label: const Text('Capture Photo', style: TextStyle(fontSize: 11)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (insp.photos.isEmpty)
                  const Text('No photos captured yet.', style: TextStyle(fontSize: 11, color: AppTheme.slate500))
                else
                  ...insp.photos.map((p) => Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.slate100,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.image_outlined, size: 16, color: AppTheme.slate700),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                p,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const Icon(Icons.check_circle, size: 16, color: AppTheme.emeraldGreen),
                          ],
                        ),
                      )),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => _tabController.animateTo(4),
          icon: const Icon(Icons.arrow_forward, size: 16),
          label: const Text('Proceed to Certification & Stamping'),
        ),
      ],
    );
  }

  // TAB 5: Certification
  Widget _buildCertificationTab(AppState state, insp) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Officer Remarks & Statutory Determination',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _remarksController,
                  maxLines: 3,
                  style: const TextStyle(fontSize: 12),
                  decoration: const InputDecoration(
                    hintText: 'Enter statutory remarks on verification compliance, lead seal wire stamp numbers, etc.',
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        if (insp.status == 'COMPLETED') ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.emeraldLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.emeraldGreen.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.verified, color: AppTheme.emeraldGreen, size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Certificate Issued & Stamped',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.emeraldGreen,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Certificate ID: ${insp.certificateNumber ?? "LM-DEL-2026-XXXXX"}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Courier',
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CertificatePreviewScreen(inspection: insp),
                      ),
                    );
                  },
                  icon: const Icon(Icons.qr_code, size: 18),
                  label: const Text('View Stamped Certificate & QR Code'),
                ),
              ],
            ),
          ),
        ] else ...[
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.emeraldGreen,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            onPressed: () async {
              await state.completeInspection(
                inspId: insp.id,
                remarks: _remarksController.text.isNotEmpty
                    ? _remarksController.text
                    : 'Instrument verified in accordance with Legal Metrology General Rules 2011 Schedule VII. Errors within permissible tolerances.',
                isPass: true,
              );

              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✓ Digital Certificate issued and stamped locally!'),
                    backgroundColor: AppTheme.emeraldGreen,
                  ),
                );
                _tabController.animateTo(4);
              }
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.verified_outlined, size: 18),
                SizedBox(width: 8),
                Text(
                  'APPROVE & ISSUE DIGITAL CERTIFICATE',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.roseError,
              side: const BorderSide(color: AppTheme.roseError),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () async {
              await state.completeInspection(
                inspId: insp.id,
                remarks: _remarksController.text.isNotEmpty
                    ? _remarksController.text
                    : 'Verification failed: Scale exceeded maximum permissible error tolerance.',
                isPass: false,
              );
              if (mounted) {
                Navigator.of(context).pop();
              }
            },
            child: const Text('REJECT / MARK AS FAILED'),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
            ),
          ),
          Expanded(
            child: Text(
              val,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.slate700),
            ),
          ),
        ],
      ),
    );
  }
}
