import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../models/inspection_model.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';

class MeasurementDraft {
  final String id;
  String testLoad;
  String observed;
  String mpe;

  MeasurementDraft({
    required this.id,
    this.testLoad = '',
    this.observed = '',
    this.mpe = '',
  });

  factory MeasurementDraft.fromMeasurement(
      MeasurementItem measurement, int index) {
    return MeasurementDraft(
      id: 'measurement-$index',
      testLoad: measurement.testLoad,
      observed: measurement.observed,
      mpe: measurement.mpe,
    );
  }
}

class EvidenceDraft {
  final String documentId;
  final String fileName;

  const EvidenceDraft({
    required this.documentId,
    required this.fileName,
  });
}

class Quantity {
  final double value;
  final String unit;
  final double? factor;

  const Quantity({
    required this.value,
    required this.unit,
    required this.factor,
  });
}

class MeasurementEvaluation {
  final String state;
  final String label;
  final String error;
  final String result;

  const MeasurementEvaluation({
    required this.state,
    required this.label,
    this.error = '',
    this.result = '',
  });

  bool get isValid => result == 'PASS' || result == 'FAIL';
}

const _unitFactors = {
  'mg': 0.001,
  'milligram': 0.001,
  'milligrams': 0.001,
  'g': 1.0,
  'gm': 1.0,
  'gram': 1.0,
  'grams': 1.0,
  'kg': 1000.0,
  'kgs': 1000.0,
  'kilogram': 1000.0,
  'kilograms': 1000.0,
  't': 1000000.0,
  'ton': 1000000.0,
  'tons': 1000000.0,
  'tonne': 1000000.0,
  'tonnes': 1000000.0,
};

class InspectionDetailScreen extends StatefulWidget {
  final String inspectionId;

  const InspectionDetailScreen({super.key, required this.inspectionId});

  @override
  State<InspectionDetailScreen> createState() => _InspectionDetailScreenState();
}

class _InspectionDetailScreenState extends State<InspectionDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _remarksController = TextEditingController();
  final _imagePicker = ImagePicker();

  String? _loadedInspectionId;
  List<MeasurementDraft> _measurementRows = [];
  List<EvidenceDraft> _uploadedEvidence = [];
  bool _visualInspectionPassed = true;
  bool _levelingZeroPassed = true;
  bool _stampingPlaqueValid = true;
  bool _isStarting = false;
  bool _isSubmitting = false;
  bool _isUploadingEvidence = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
    final inspection = _findInspection(state.inspections, widget.inspectionId);

    if (inspection == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Inspection')),
        body: const Center(child: Text('Inspection not found.')),
      );
    }

    _syncLocalForm(inspection);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(inspection.id),
            Text(
              inspection.instrumentName,
              style: const TextStyle(fontSize: 10, color: AppTheme.slate300),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
                child: StatusBadge(status: inspection.status, isSmall: true)),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: AppTheme.slate300,
          indicatorColor: AppTheme.emeraldGreen,
          indicatorWeight: 3,
          labelStyle:
              const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'Details'),
            Tab(text: 'Measurements'),
            Tab(text: 'Submit'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDetailsTab(state, inspection),
          _buildMeasurementsTab(inspection),
          _buildSubmitTab(state, inspection),
        ],
      ),
    );
  }

  void _syncLocalForm(InspectionModel inspection) {
    if (_loadedInspectionId == inspection.id) return;
    _loadedInspectionId = inspection.id;

    _measurementRows = inspection.measurements.isEmpty
        ? [_newMeasurementDraft()]
        : List.generate(
            inspection.measurements.length,
            (index) => MeasurementDraft.fromMeasurement(
              inspection.measurements[index],
              index + 1,
            ),
          );
    _uploadedEvidence = inspection.evidence
        .map((item) => EvidenceDraft(
              documentId: item.documentId,
              fileName: item.fileName,
            ))
        .toList();
    _remarksController.text = inspection.remarks;
    _visualInspectionPassed =
        _checklistValue(inspection, 'visualInspectionPassed');
    _levelingZeroPassed = _checklistValue(inspection, 'levelingZeroPassed');
    _stampingPlaqueValid = _checklistValue(inspection, 'stampingPlaqueValid');
  }

  bool _checklistValue(InspectionModel inspection, String id) {
    for (final item in inspection.checklistItems) {
      if (item.id == id) return item.passed;
    }
    return true;
  }

  InspectionModel? _findInspection(
    List<InspectionModel> inspections,
    String inspectionId,
  ) {
    for (final inspection in inspections) {
      if (inspection.id == inspectionId) return inspection;
    }
    return null;
  }

  Widget _buildDetailsTab(AppState state, InspectionModel inspection) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Inspection Assignment',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                    ),
                    StatusBadge(status: inspection.status, isSmall: true),
                  ],
                ),
                const SizedBox(height: 12),
                _buildInfoRow('Inspection ID', inspection.id),
                _buildInfoRow('Application ID', inspection.applicationId),
                _buildInfoRow('Scheduled Date', inspection.scheduledDate),
                _buildInfoRow('District', inspection.district),
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
                  'Instrument and Business',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 12),
                _buildInfoRow('Business', inspection.ownerName),
                _buildInfoRow('Instrument', inspection.instrumentName),
                _buildInfoRow('Category', inspection.category),
                _buildInfoRow('Serial Number', inspection.serialNumber),
                _buildInfoRow('Capacity', inspection.capacity),
                _buildInfoRow('Location', inspection.location),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (inspection.isActionable)
          ElevatedButton.icon(
            onPressed:
                _isStarting ? null : () => _startInspection(state, inspection),
            icon: _isStarting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.play_circle_outline, size: 18),
            label: Text(_isStarting ? 'Starting...' : 'Start Field Inspection'),
          )
        else
          ElevatedButton.icon(
            onPressed: () => _tabController.animateTo(1),
            icon: const Icon(Icons.arrow_forward, size: 18),
            label: const Text('Open Measurements'),
          ),
      ],
    );
  }

  Widget _buildMeasurementsTab(InspectionModel inspection) {
    final canEdit = inspection.isInProgress;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            const Expanded(
              child: Text(
                'Load Verification Measurements',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
            ),
            if (canEdit)
              TextButton.icon(
                onPressed: () {
                  setState(() => _measurementRows.add(_newMeasurementDraft()));
                },
                icon: const Icon(Icons.add, size: 17),
                label: const Text('Add Value'),
              ),
          ],
        ),
        const SizedBox(height: 4),
        const Text(
          'Enter test load, indicated reading, and MPE using units like g or kg.',
          style: TextStyle(fontSize: 11, color: AppTheme.slate500),
        ),
        const SizedBox(height: 12),
        ...List.generate(_measurementRows.length, (index) {
          final row = _measurementRows[index];
          return _buildMeasurementCard(row, index, canEdit);
        }),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => _tabController.animateTo(2),
          icon: const Icon(Icons.arrow_forward, size: 18),
          label: const Text('Proceed to Submit'),
        ),
      ],
    );
  }

  Widget _buildMeasurementCard(MeasurementDraft row, int index, bool canEdit) {
    final evaluation = _evaluateMeasurement(row);
    final color = switch (evaluation.state) {
      'PASS' => AppTheme.emeraldGreen,
      'FAIL' => AppTheme.roseError,
      'INVALID' => AppTheme.amberWarning,
      _ => AppTheme.slate500,
    };

    return Card(
      key: ValueKey(row.id),
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Measurement ${index + 1}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    evaluation.label,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
                if (canEdit && _measurementRows.length > 1) ...[
                  const SizedBox(width: 6),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.delete_outline, size: 18),
                    color: AppTheme.roseError,
                    onPressed: () {
                      setState(() {
                        _measurementRows
                            .removeWhere((item) => item.id == row.id);
                      });
                    },
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            TextFormField(
              initialValue: row.testLoad,
              enabled: canEdit,
              decoration: const InputDecoration(
                labelText: 'Test load',
                hintText: '500 kg',
                prefixIcon: Icon(Icons.scale_outlined, size: 18),
              ),
              onChanged: (value) => setState(() => row.testLoad = value),
            ),
            const SizedBox(height: 10),
            TextFormField(
              initialValue: row.observed,
              enabled: canEdit,
              decoration: const InputDecoration(
                labelText: 'Indicated reading',
                hintText: '502 kg',
                prefixIcon: Icon(Icons.straighten, size: 18),
              ),
              onChanged: (value) => setState(() => row.observed = value),
            ),
            const SizedBox(height: 10),
            TextFormField(
              initialValue: row.mpe,
              enabled: canEdit,
              decoration: const InputDecoration(
                labelText: 'MPE limit',
                hintText: '5 kg',
                prefixIcon: Icon(Icons.rule, size: 18),
              ),
              onChanged: (value) => setState(() => row.mpe = value),
            ),
            if (evaluation.error.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                'Calculated error: ${evaluation.error}',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitTab(AppState state, InspectionModel inspection) {
    final canEdit = inspection.isInProgress;
    final evaluations = _measurementRows.map(_evaluateMeasurement).toList();
    final allMeasurementsValid =
        evaluations.isNotEmpty && evaluations.every((item) => item.isValid);
    final hasFailedMeasurement =
        evaluations.any((item) => item.result == 'FAIL');

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
                  'Physical Verification Checklist',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 10),
                _buildChecklistSwitch(
                  label: 'Visual plaque and markings verified',
                  value: _visualInspectionPassed,
                  enabled: canEdit,
                  onChanged: (value) {
                    setState(() => _visualInspectionPassed = value);
                  },
                ),
                _buildChecklistSwitch(
                  label: 'Leveling and zero-setting verified',
                  value: _levelingZeroPassed,
                  enabled: canEdit,
                  onChanged: (value) {
                    setState(() => _levelingZeroPassed = value);
                  },
                ),
                _buildChecklistSwitch(
                  label: 'Stamping plaque and seal provision verified',
                  value: _stampingPlaqueValid,
                  enabled: canEdit,
                  onChanged: (value) {
                    setState(() => _stampingPlaqueValid = value);
                  },
                ),
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
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Evidence Upload',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                    ),
                    if (_isUploadingEvidence)
                      const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Attach instrument or seal photos when required. GPS is not captured in this mobile version.',
                  style: TextStyle(fontSize: 11, color: AppTheme.slate500),
                ),
                const SizedBox(height: 12),
                if (canEdit)
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      OutlinedButton.icon(
                        onPressed: _isUploadingEvidence
                            ? null
                            : () => _pickEvidence(state, ImageSource.camera),
                        icon: const Icon(Icons.camera_alt_outlined, size: 17),
                        label: const Text('Camera'),
                      ),
                      OutlinedButton.icon(
                        onPressed: _isUploadingEvidence
                            ? null
                            : () => _pickEvidence(state, ImageSource.gallery),
                        icon:
                            const Icon(Icons.photo_library_outlined, size: 17),
                        label: const Text('Gallery'),
                      ),
                    ],
                  ),
                const SizedBox(height: 10),
                if (_uploadedEvidence.isEmpty)
                  const Text(
                    'No evidence uploaded yet.',
                    style: TextStyle(fontSize: 11, color: AppTheme.slate500),
                  )
                else
                  ..._uploadedEvidence.map(
                    (item) => Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.slate100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.image_outlined,
                              size: 16, color: AppTheme.slate700),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              item.fileName,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Icon(Icons.check_circle,
                              size: 16, color: AppTheme.emeraldGreen),
                        ],
                      ),
                    ),
                  ),
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
                  'Officer Remarks',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _remarksController,
                  enabled: canEdit,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText:
                        'Enter field observations and verification remarks.',
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        if (!canEdit)
          _buildNotice(
            icon: Icons.lock_outline,
            color: AppTheme.slate500,
            title: 'Read-only record',
            message: inspection.isActionable
                ? 'Start the inspection before entering field values.'
                : 'This inspection has already been submitted or closed.',
          )
        else if (!allMeasurementsValid)
          _buildNotice(
            icon: Icons.info_outline,
            color: AppTheme.amberWarning,
            title: 'Measurement values required',
            message:
                'Every row must include numeric test load, indicated reading, and MPE limit.',
          )
        else if (hasFailedMeasurement)
          _buildNotice(
            icon: Icons.warning_amber_outlined,
            color: AppTheme.roseError,
            title: 'Failed measurement included',
            message:
                'You can submit the failure record. Final certificate approval will be blocked by the backend.',
          ),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          onPressed: canEdit && allMeasurementsValid && !_isSubmitting
              ? () => _submitInspection(state, inspection)
              : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: hasFailedMeasurement
                ? AppTheme.roseError
                : AppTheme.emeraldGreen,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          icon: _isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.task_alt, size: 18),
          label: Text(_isSubmitting ? 'Submitting...' : 'Submit Verification'),
        ),
      ],
    );
  }

  Widget _buildChecklistSwitch({
    required String label,
    required bool value,
    required bool enabled,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      activeThumbColor: AppTheme.emeraldGreen,
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryNavy,
        ),
      ),
      value: value,
      onChanged: enabled ? onChanged : null,
    );
  }

  Widget _buildNotice({
    required IconData icon,
    required Color color,
    required String title,
    required String message,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: color,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  message,
                  style:
                      const TextStyle(fontSize: 11, color: AppTheme.slate700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 118,
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
            ),
          ),
          Expanded(
            child: Text(
              value.isEmpty ? 'Not recorded' : value,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppTheme.slate700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _startInspection(
      AppState state, InspectionModel inspection) async {
    setState(() => _isStarting = true);
    try {
      await state.startInspection(inspection.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inspection started.')),
      );
      _tabController.animateTo(1);
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _isStarting = false);
    }
  }

  Future<void> _pickEvidence(AppState state, ImageSource source) async {
    setState(() => _isUploadingEvidence = true);
    try {
      final pickedFile = await _imagePicker.pickImage(
        source: source,
        imageQuality: 75,
      );
      if (pickedFile == null) return;

      final bytes = await pickedFile.readAsBytes();
      final uploaded = await state.uploadInspectionEvidence(
        fileName: pickedFile.name,
        mimeType: _mimeTypeFor(pickedFile.name),
        base64: base64Encode(bytes),
      );
      final documentId = uploaded['documentId']?.toString() ?? '';
      if (documentId.isEmpty) {
        throw Exception('Upload completed without a document ID.');
      }

      if (!mounted) return;
      setState(() {
        _uploadedEvidence.add(
          EvidenceDraft(
            documentId: documentId,
            fileName: uploaded['fileName']?.toString() ?? pickedFile.name,
          ),
        );
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Evidence uploaded.')),
      );
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _isUploadingEvidence = false);
    }
  }

  Future<void> _submitInspection(
    AppState state,
    InspectionModel inspection,
  ) async {
    final evaluations = _measurementRows.map(_evaluateMeasurement).toList();
    if (!evaluations.every((item) => item.isValid)) {
      _showError('Complete all measurement rows first.');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final measurements = <MeasurementItem>[];
      for (var index = 0; index < _measurementRows.length; index += 1) {
        final row = _measurementRows[index];
        final evaluation = evaluations[index];
        measurements.add(
          MeasurementItem(
            testLoad: row.testLoad,
            observed: row.observed,
            mpe: row.mpe,
            error: evaluation.error,
            result: evaluation.result,
          ),
        );
      }

      await state.submitInspection(
        inspectionId: inspection.id,
        measurements: measurements,
        checklist: {
          'visualInspectionPassed': _visualInspectionPassed,
          'levelingZeroPassed': _levelingZeroPassed,
          'stampingPlaqueValid': _stampingPlaqueValid,
        },
        evidenceDocumentIds:
            _uploadedEvidence.map((item) => item.documentId).toList(),
        remarks: _remarksController.text,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification submitted for AC review.')),
      );
      Navigator.of(context).pop();
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  MeasurementDraft _newMeasurementDraft() {
    return MeasurementDraft(
      id: 'measurement-${DateTime.now().microsecondsSinceEpoch}',
    );
  }

  MeasurementEvaluation _evaluateMeasurement(MeasurementDraft row) {
    final hasAnyValue = row.testLoad.trim().isNotEmpty ||
        row.observed.trim().isNotEmpty ||
        row.mpe.trim().isNotEmpty;
    if (!hasAnyValue) {
      return const MeasurementEvaluation(
        state: 'EMPTY',
        label: 'Enter values',
      );
    }

    final testQuantity = _parseQuantity(row.testLoad);
    final observedQuantity = _parseQuantity(row.observed);
    final mpeQuantity = _parseQuantity(row.mpe);
    if (testQuantity == null ||
        observedQuantity == null ||
        mpeQuantity == null) {
      return const MeasurementEvaluation(
        state: 'INVALID',
        label: 'Incomplete',
      );
    }

    final fallbackFactor = testQuantity.factor ??
        observedQuantity.factor ??
        mpeQuantity.factor ??
        1;
    final testBase = _toBaseValue(testQuantity, fallbackFactor);
    final observedBase = _toBaseValue(observedQuantity, fallbackFactor);
    final mpeBase = _toBaseValue(mpeQuantity, fallbackFactor).abs();
    final errorBase = observedBase - testBase;
    final displayFactor =
        testQuantity.factor ?? observedQuantity.factor ?? fallbackFactor;
    final displayUnit = testQuantity.unit.isNotEmpty
        ? testQuantity.unit
        : observedQuantity.unit;
    final error =
        '${_formatNumber(errorBase / displayFactor)}${displayUnit.isEmpty ? '' : ' $displayUnit'}';
    final result = errorBase.abs() <= mpeBase ? 'PASS' : 'FAIL';

    return MeasurementEvaluation(
      state: result,
      result: result,
      error: error,
      label: result == 'PASS' ? 'Within MPE' : 'Exceeds MPE',
    );
  }

  Quantity? _parseQuantity(String value) {
    final match = RegExp(r'([-+]?\d*\.?\d+)\s*([a-zA-Z]*)')
        .firstMatch(value.trim().replaceAll(',', ''));
    if (match == null) return null;

    final number = double.tryParse(match.group(1) ?? '');
    if (number == null) return null;

    final unit = (match.group(2) ?? '').toLowerCase();
    return Quantity(
      value: number,
      unit: unit,
      factor: unit.isEmpty ? null : _unitFactors[unit],
    );
  }

  double _toBaseValue(Quantity quantity, double fallbackFactor) {
    return quantity.value * (quantity.factor ?? fallbackFactor);
  }

  String _formatNumber(double value) {
    final rounded = (value * 1000).roundToDouble() / 1000;
    if (rounded == rounded.truncateToDouble()) {
      return rounded.toInt().toString();
    }
    return rounded.toString();
  }

  String _mimeTypeFor(String fileName) {
    final lower = fileName.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }

  void _showError(Object error) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(error.toString().replaceFirst('Exception: ', '')),
        backgroundColor: AppTheme.roseError,
      ),
    );
  }
}
