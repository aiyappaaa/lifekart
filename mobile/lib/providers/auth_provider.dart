import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../core/network/api_client.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiClientProvider));
});

class AuthState {
  final bool isAuthenticated;
  final String? role;
  final bool isLoading;

  AuthState({this.isAuthenticated = false, this.role, this.isLoading = false});

  AuthState copyWith({bool? isAuthenticated, String? role, bool? isLoading}) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      role: role ?? this.role,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Dio _dio;
  final _storage = const FlutterSecureStorage();

  AuthNotifier(this._dio) : super(AuthState()) {
    _checkInitialAuth();
  }

  Future<void> _checkInitialAuth() async {
    state = state.copyWith(isLoading: true);
    final token = await _storage.read(key: 'jwt_token');
    final role = await _storage.read(key: 'user_role');
    
    if (token != null && role != null) {
      state = state.copyWith(isAuthenticated: true, role: role, isLoading: false);
    } else {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      final token = response.data['access_token'];
      final userResponse = await _dio.get(
        '/auth/me',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      final role = userResponse.data['role'];

      await _storage.write(key: 'jwt_token', value: token);
      await _storage.write(key: 'user_role', value: role);

      state = state.copyWith(isAuthenticated: true, role: role, isLoading: false);
      return true;
    } catch (e) {
      print('Login error: $e');
      state = state.copyWith(isLoading: false);
      return false;
    }
  }

  Future<bool> register(String email, String password, String name) async {
    state = state.copyWith(isLoading: true);
    try {
      await _dio.post('/auth/register', data: {
        'email': email,
        'password': password,
        'full_name': name,
        'role': 'customer',
      });
      return await login(email, password);
    } catch (e) {
      print('Registration error: $e');
      state = state.copyWith(isLoading: false);
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user_role');
    state = AuthState();
  }
}
