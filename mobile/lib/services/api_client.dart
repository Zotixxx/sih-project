import 'dart:convert';

import 'package:http/http.dart' as http;

class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'METRIX_API_BASE_URL',
    defaultValue: 'https://sih-project-bpyq.onrender.com/api',
  );
  static const supabaseUrl = String.fromEnvironment(
    'METRIX_SUPABASE_URL',
    defaultValue: '',
  );
  static const supabasePublishableKey = String.fromEnvironment(
    'METRIX_SUPABASE_PUBLISHABLE_KEY',
    defaultValue: '',
  );

  static bool get hasSupabaseAuth =>
      supabaseUrl.trim().isNotEmpty && supabasePublishableKey.trim().isNotEmpty;
}

class AuthSession {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;

  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  factory AuthSession.fromSupabase(Map<String, dynamic> body) {
    final expiresIn =
        body['expires_in'] is int ? body['expires_in'] as int : 3600;
    return AuthSession(
      accessToken: body['access_token']?.toString() ?? '',
      refreshToken: body['refresh_token']?.toString() ?? '',
      expiresAt: DateTime.now().add(Duration(seconds: expiresIn)),
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? code;

  const ApiException(this.message, {this.statusCode, this.code});

  @override
  String toString() => message;
}

class MetrixApiClient {
  const MetrixApiClient();

  Uri _apiUri(String path) {
    final base = AppConfig.apiBaseUrl.replaceFirst(RegExp(r'/$'), '');
    final endpoint = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$endpoint');
  }

  Uri _supabaseUri(String path) {
    final base = AppConfig.supabaseUrl.replaceFirst(RegExp(r'/$'), '');
    return Uri.parse('$base$path');
  }

  Map<String, String> _jsonHeaders({String? accessToken}) => {
        'Content-Type': 'application/json',
        if (accessToken != null && accessToken.isNotEmpty)
          'Authorization': 'Bearer $accessToken',
      };

  Map<String, String> _supabaseHeaders({String? accessToken}) => {
        'Content-Type': 'application/json',
        'apikey': AppConfig.supabasePublishableKey,
        if (accessToken != null && accessToken.isNotEmpty)
          'Authorization': 'Bearer $accessToken',
      };

  dynamic _decodeJson(http.Response response) {
    if (response.body.trim().isEmpty) return {};
    try {
      return jsonDecode(response.body);
    } catch (_) {
      return {'message': response.body};
    }
  }

  Map<String, dynamic> _decodeApiResponse(http.Response response) {
    final body = _decodeJson(response);
    final isOk = response.statusCode >= 200 && response.statusCode < 300;
    if (isOk) {
      return body is Map<String, dynamic> ? body : {'data': body};
    }

    String message = 'Request failed with HTTP ${response.statusCode}.';
    String? code;
    if (body is Map<String, dynamic>) {
      final error = body['error'];
      if (error is Map<String, dynamic>) {
        message = error['message']?.toString() ?? message;
        code = error['code']?.toString();
      } else {
        message = body['message']?.toString() ??
            body['error_description']?.toString() ??
            body['msg']?.toString() ??
            message;
        code = body['code']?.toString();
      }
    }

    throw ApiException(message, statusCode: response.statusCode, code: code);
  }

  Future<AuthSession> signInWithPassword({
    required String email,
    required String password,
  }) async {
    if (!AppConfig.hasSupabaseAuth) {
      throw const ApiException(
        'Mobile Supabase configuration is missing. Launch with METRIX_SUPABASE_URL and METRIX_SUPABASE_PUBLISHABLE_KEY.',
      );
    }

    final response = await http.post(
      _supabaseUri('/auth/v1/token?grant_type=password'),
      headers: _supabaseHeaders(),
      body: jsonEncode({'email': email.trim(), 'password': password}),
    );
    final body = _decodeApiResponse(response);
    final session = AuthSession.fromSupabase(body);
    if (session.accessToken.isEmpty) {
      throw const ApiException('Supabase did not return an access token.');
    }
    return session;
  }

  Future<AuthSession> refreshSession(String refreshToken) async {
    if (!AppConfig.hasSupabaseAuth || refreshToken.isEmpty) {
      throw const ApiException('Saved mobile session cannot be refreshed.');
    }

    final response = await http.post(
      _supabaseUri('/auth/v1/token?grant_type=refresh_token'),
      headers: _supabaseHeaders(),
      body: jsonEncode({'refresh_token': refreshToken}),
    );
    return AuthSession.fromSupabase(_decodeApiResponse(response));
  }

  Future<Map<String, dynamic>> getProfile(String accessToken) async {
    final response = await http.get(
      _apiUri('/auth/profile'),
      headers: _jsonHeaders(accessToken: accessToken),
    );
    final body = _decodeApiResponse(response);
    return Map<String, dynamic>.from(body['data'] as Map? ?? {});
  }

  Future<List<Map<String, dynamic>>> getInspections(String accessToken) async {
    final response = await http.get(
      _apiUri('/inspections'),
      headers: _jsonHeaders(accessToken: accessToken),
    );
    final body = _decodeApiResponse(response);
    final data = body['data'];
    if (data is List) {
      return data
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> startInspection({
    required String accessToken,
    required String inspectionId,
  }) async {
    final response = await http.post(
      _apiUri('/inspections/$inspectionId/start'),
      headers: _jsonHeaders(accessToken: accessToken),
    );
    final body = _decodeApiResponse(response);
    return Map<String, dynamic>.from(body['data'] as Map? ?? {});
  }

  Future<Map<String, dynamic>> submitInspection({
    required String accessToken,
    required String inspectionId,
    required Map<String, dynamic> payload,
  }) async {
    final response = await http.post(
      _apiUri('/inspections/$inspectionId/submit'),
      headers: _jsonHeaders(accessToken: accessToken),
      body: jsonEncode(payload),
    );
    final body = _decodeApiResponse(response);
    return Map<String, dynamic>.from(body['data'] as Map? ?? {});
  }

  Future<Map<String, dynamic>> uploadDocument({
    required String accessToken,
    required String bucket,
    required String fileName,
    required String mimeType,
    required String base64,
  }) async {
    final response = await http.post(
      _apiUri('/documents/upload'),
      headers: _jsonHeaders(accessToken: accessToken),
      body: jsonEncode({
        'bucket': bucket,
        'fileName': fileName,
        'mimeType': mimeType,
        'base64': base64,
      }),
    );
    final body = _decodeApiResponse(response);
    return Map<String, dynamic>.from(body['data'] as Map? ?? {});
  }
}
