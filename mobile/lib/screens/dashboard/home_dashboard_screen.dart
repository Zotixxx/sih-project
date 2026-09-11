import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/inspection_model.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import '../inspection/inspection_detail_screen.dart';
import '../profile/officer_profile_screen.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _currentTab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await context.read<AppState>().refreshData();
      } catch (_) {
        // The provider exposes the error message in the UI.
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(state.officer.name),
            Text(
              '${state.officer.badgeId} | ${state.officer.zone.isEmpty ? state.officer.districtId : state.officer.zone}',
              style: const TextStyle(fontSize: 10, color: AppTheme.slate300),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh),
            onPressed: state.isLoading
                ? null
                : () async {
                    try {
                      await context.read<AppState>().refreshData();
                    } catch (_) {}
                  },
          ),
          IconButton(
            tooltip: 'Profile',
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const OfficerProfileScreen()),
              );
            },
          ),
        ],
      ),
      body: _currentTab == 0
          ? _buildInspectionQueue(state)
          : _buildSubmittedRecords(state),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        selectedItemColor: AppTheme.primaryNavy,
        unselectedItemColor: AppTheme.slate500,
        selectedLabelStyle:
            const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        onTap: (index) {
          if (index == 2) {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const OfficerProfileScreen()),
            );
            return;
          }
          setState(() => _currentTab = index);
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Inspections',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.fact_check_outlined),
            activeIcon: Icon(Icons.fact_check),
            label: 'Submitted',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildInspectionQueue(AppState state) {
    final inspections = state.filteredInspections;

    return RefreshIndicator(
      onRefresh: () async {
        try {
          await state.refreshData();
        } catch (_) {}
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHeader(state),
          const SizedBox(height: 16),
          if (state.errorMessage != null) _buildErrorBanner(state),
          _buildSearchBox(state),
          const SizedBox(height: 12),
          _buildFilterChips(state),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Assigned Field Work',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              Text(
                '${inspections.length} records',
                style: const TextStyle(fontSize: 11, color: AppTheme.slate500),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (state.isLoading && inspections.isEmpty)
            const Padding(
              padding: EdgeInsets.all(40),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (inspections.isEmpty)
            _buildEmptyState('No assigned inspections found.')
          else
            ...inspections.map(_buildInspectionCard),
        ],
      ),
    );
  }

  Widget _buildSubmittedRecords(AppState state) {
    final records = state.inspections
        .where((inspection) => inspection.isSubmitted)
        .toList();

    return RefreshIndicator(
      onRefresh: () async {
        try {
          await state.refreshData();
        } catch (_) {}
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHeader(state),
          const SizedBox(height: 16),
          const Text(
            'Submitted Verification Records',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 8),
          if (records.isEmpty)
            _buildEmptyState('No submitted verification records yet.')
          else
            ...records.map(_buildInspectionCard),
        ],
      ),
    );
  }

  Widget _buildHeader(AppState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.primaryNavy,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.badge_outlined, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'LMO Field Dashboard',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${state.officer.designation} | ${state.officer.districtId}',
                      style: const TextStyle(
                          color: AppTheme.slate300, fontSize: 11),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                title: 'Assigned',
                count: state.assignedCount.toString(),
                color: AppTheme.amberWarning,
                icon: Icons.schedule,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildMetricCard(
                title: 'In Progress',
                count: state.inProgressCount.toString(),
                color: AppTheme.blueInfo,
                icon: Icons.edit_note,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildMetricCard(
                title: 'Submitted',
                count: state.submittedCount.toString(),
                color: AppTheme.emeraldGreen,
                icon: Icons.verified,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String count,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            count,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: AppTheme.slate500),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner(AppState state) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.roseLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.roseError.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppTheme.roseError, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              state.errorMessage!,
              style: const TextStyle(color: AppTheme.roseError, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBox(AppState state) {
    return TextField(
      onChanged: state.setSearchQuery,
      decoration: InputDecoration(
        hintText: 'Search inspection, business, instrument, serial...',
        hintStyle: const TextStyle(fontSize: 12),
        prefixIcon: const Icon(Icons.search, size: 20),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(vertical: 0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
    );
  }

  Widget _buildFilterChips(AppState state) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildFilterChip(state, 'ALL', 'All'),
          const SizedBox(width: 8),
          _buildFilterChip(
              state, 'ASSIGNED', 'Assigned (${state.assignedCount})'),
          const SizedBox(width: 8),
          _buildFilterChip(
              state, 'IN_PROGRESS', 'In Progress (${state.inProgressCount})'),
          const SizedBox(width: 8),
          _buildFilterChip(
              state, 'SUBMITTED', 'Submitted (${state.submittedCount})'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(AppState state, String id, String label) {
    final isSelected = state.filterStatus == id;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppTheme.primaryNavy,
      backgroundColor: Colors.white,
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: isSelected ? Colors.white : AppTheme.slate700,
      ),
      side: BorderSide(
        color: isSelected ? AppTheme.primaryNavy : const Color(0xFFE2E8F0),
      ),
      onSelected: (_) => state.setFilterStatus(id),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      padding: const EdgeInsets.all(32),
      alignment: Alignment.center,
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 12, color: AppTheme.slate500),
      ),
    );
  }

  Widget _buildInspectionCard(InspectionModel inspection) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) =>
                  InspectionDetailScreen(inspectionId: inspection.id),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      inspection.id,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.slate500,
                        fontFamily: 'Courier',
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  StatusBadge(status: inspection.status, isSmall: true),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                inspection.instrumentName,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'S/N: ${inspection.serialNumber.isEmpty ? 'Not recorded' : inspection.serialNumber} | ${inspection.category}',
                style: const TextStyle(fontSize: 11, color: AppTheme.slate700),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.business_outlined,
                      size: 14, color: AppTheme.slate500),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      inspection.ownerName,
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.slate700),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 14, color: AppTheme.slate500),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      inspection.location.isEmpty
                          ? 'Verification location not recorded'
                          : inspection.location,
                      style: const TextStyle(
                          fontSize: 11, color: AppTheme.slate500),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Divider(height: 1, color: Color(0xFFF1F5F9)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    inspection.scheduledDate.isEmpty
                        ? 'No scheduled date'
                        : 'Scheduled: ${inspection.scheduledDate}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.slate700,
                    ),
                  ),
                  const Text(
                    'Open',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
