import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import '../inspection/inspection_detail_screen.dart';
import '../sync/sync_queue_screen.dart';
import '../profile/officer_profile_screen.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({Key? key}) : super(key: key);

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _currentTab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppState>().init();
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
              '${state.officer.badgeId} • ${state.officer.zone}',
              style: const TextStyle(fontSize: 10, color: AppTheme.slate300),
            ),
          ],
        ),
        actions: [
          // Online / Offline Toggle Simulator
          IconButton(
            tooltip: state.isOnline ? 'Online Mode' : 'Offline Mode',
            icon: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: state.isOnline ? AppTheme.emeraldGreen : AppTheme.roseError,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  state.isOnline ? 'ONLINE' : 'OFFLINE',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 8),
              ],
            ),
            onPressed: () => state.toggleOnlineOffline(),
          ),
          IconButton(
            icon: const Icon(Icons.sync_outlined),
            tooltip: 'Sync Center',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SyncQueueScreen()),
              );
            },
          ),
        ],
      ),
      body: _buildBody(state),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        selectedItemColor: AppTheme.primaryNavy,
        unselectedItemColor: AppTheme.slate500,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        onTap: (index) {
          if (index == 1) {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SyncQueueScreen()),
            );
          } else if (index == 2) {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const OfficerProfileScreen()),
            );
          } else {
            setState(() => _currentTab = index);
          }
        },
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Inspections',
          ),
          BottomNavigationBarItem(
            icon: Stack(
              children: [
                const Icon(Icons.cloud_sync_outlined),
                if (state.unsyncedCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: AppTheme.roseError,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                    ),
                  ),
              ],
            ),
            label: 'Offline Sync',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildBody(AppState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    final inspections = state.filteredInspections;

    return RefreshIndicator(
      onRefresh: () => state.init(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Metric Summary Cards
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  title: 'Assigned',
                  count: state.scheduledCount.toString(),
                  color: AppTheme.amberWarning,
                  icon: Icons.schedule,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricCard(
                  title: 'Completed',
                  count: state.completedCount.toString(),
                  color: AppTheme.emeraldGreen,
                  icon: Icons.verified,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricCard(
                  title: 'Unsynced',
                  count: state.unsyncedCount.toString(),
                  color: AppTheme.blueInfo,
                  icon: Icons.cloud_off,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Unsynced Alert Banner
          if (state.unsyncedCount > 0)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.blueLight,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.blueInfo.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_upload_outlined, color: AppTheme.blueInfo, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${state.unsyncedCount} inspection record(s) pending cloud synchronization.',
                      style: const TextStyle(color: AppTheme.blueInfo, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const SyncQueueScreen()),
                      );
                    },
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('SYNC NOW', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

          // Search Box
          TextField(
            onChanged: (val) => state.setSearchQuery(val),
            decoration: InputDecoration(
              hintText: 'Search by instrument, owner, ID...',
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
          ),
          const SizedBox(height: 12),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip(state, 'ALL', 'All Inspections'),
                const SizedBox(width: 8),
                _buildFilterChip(state, 'SCHEDULED', 'Scheduled (${state.scheduledCount})'),
                const SizedBox(width: 8),
                _buildFilterChip(state, 'COMPLETED', 'Completed (${state.completedCount})'),
                const SizedBox(width: 8),
                _buildFilterChip(state, 'UNSYNCED', 'Unsynced (${state.unsyncedCount})'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Section Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Today\'s Field Itinerary',
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

          // Inspections List
          if (inspections.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: const Text(
                'No inspection records found in this view.',
                style: TextStyle(fontSize: 12, color: AppTheme.slate500),
              ),
            )
          else
            ...inspections.map((insp) => _buildInspectionCard(insp)),
        ],
      ),
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                count,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              Text(
                title,
                style: const TextStyle(fontSize: 10, color: AppTheme.slate500),
              ),
            ],
          ),
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

  Widget _buildInspectionCard(insp) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => InspectionDetailScreen(inspectionId: insp.id),
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
                  Row(
                    children: [
                      Text(
                        insp.id,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.slate500,
                          fontFamily: 'Courier',
                        ),
                      ),
                      const SizedBox(width: 6),
                      if (!insp.isSynced)
                        const Icon(Icons.cloud_off, size: 14, color: AppTheme.blueInfo),
                    ],
                  ),
                  StatusBadge(status: insp.status, isSmall: true),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                insp.instrumentName,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'S/N: ${insp.serialNumber} • ${insp.category}',
                style: const TextStyle(fontSize: 11, color: AppTheme.slate700),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.business_outlined, size: 13, color: AppTheme.slate500),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      insp.ownerName,
                      style: const TextStyle(fontSize: 11, color: AppTheme.slate700),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 13, color: AppTheme.slate500),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      insp.location,
                      style: const TextStyle(fontSize: 10, color: AppTheme.slate500),
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
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 12, color: AppTheme.slate500),
                      const SizedBox(width: 4),
                      Text(
                        '${insp.scheduledDate} (${insp.scheduledTime})',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.slate700),
                      ),
                    ],
                  ),
                  Text(
                    insp.status == 'SCHEDULED' ? 'Start Inspection →' : 'View Details →',
                    style: const TextStyle(
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
