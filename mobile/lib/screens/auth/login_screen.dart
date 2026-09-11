import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/app_state.dart';
import '../../services/api_client.dart';
import '../../theme/app_theme.dart';
import '../dashboard/home_dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isRestoring = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _restoreSession());
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _restoreSession() async {
    final restored = await context.read<AppState>().restoreSession();
    if (!mounted) return;
    setState(() => _isRestoring = false);
    if (restored) _openDashboard();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);
    try {
      await context.read<AppState>().login(
            email: _emailController.text,
            password: _passwordController.text,
          );
      if (mounted) _openDashboard();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  void _openDashboard() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeDashboardScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final isBusy = state.isLoading || _isRestoring;

    return Scaffold(
      backgroundColor: AppTheme.primaryNavy,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                          width: 1.5,
                        ),
                      ),
                      child: const Icon(
                        Icons.balance_outlined,
                        color: Colors.white,
                        size: 38,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'LEGAL METROLOGY FIELD PORTAL',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.slate300,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'MetriX LMO',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Assigned inspections, measurements, and field submissions',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.slate300, fontSize: 12),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'LMO Sign In',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryNavy,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Use the same LMO credentials provisioned in the MetriX web portal.',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.slate500,
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'Official email',
                              prefixIcon: Icon(Icons.mail_outline, size: 18),
                            ),
                            validator: (value) {
                              final email = value?.trim() ?? '';
                              if (email.isEmpty) return 'Email is required';
                              if (!email.contains('@')) {
                                return 'Enter a valid email';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) =>
                                isBusy ? null : _handleLogin(),
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon:
                                  const Icon(Icons.lock_outline, size: 18),
                              suffixIcon: IconButton(
                                tooltip: _obscurePassword
                                    ? 'Show password'
                                    : 'Hide password',
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                            ),
                            validator: (value) {
                              if ((value ?? '').isEmpty) {
                                return 'Password is required';
                              }
                              return null;
                            },
                          ),
                          if (_errorMessage != null ||
                              state.errorMessage != null) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.roseLight,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    color: AppTheme.roseError
                                        .withValues(alpha: 0.25)),
                              ),
                              child: Text(
                                _errorMessage ?? state.errorMessage ?? '',
                                style: const TextStyle(
                                  color: AppTheme.roseError,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                          if (!AppConfig.hasSupabaseAuth) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.amberLight,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    color: AppTheme.amberWarning
                                        .withValues(alpha: 0.25)),
                              ),
                              child: const Text(
                                'Build-time Supabase config is missing. Launch with METRIX_SUPABASE_URL and METRIX_SUPABASE_PUBLISHABLE_KEY.',
                                style: TextStyle(
                                  color: AppTheme.amberWarning,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(height: 22),
                          ElevatedButton.icon(
                            onPressed: isBusy ? null : _handleLogin,
                            icon: isBusy
                                ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.login, size: 18),
                            label: Text(
                              _isRestoring ? 'Restoring Session...' : 'Sign In',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Business and Assistant Controller accounts are not allowed in this mobile app.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.slate300, fontSize: 11),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
