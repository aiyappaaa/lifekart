import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../shared/models/user.dart';
import '../models/auth_state.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());
  
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:8000/api/v1',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  Future<void> checkAuth() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token != null && token.isNotEmpty) {
        _dio.options.headers['Authorization'] = 'Bearer $token';
        // Adjust endpoint based on API structure; assuming /auth/me for current user profile
        final response = await _dio.get('/auth/me'); 
        final user = User.fromJson(response.data['data'] ?? response.data);
        
        state = state.copyWith(
          user: user,
          token: token,
          isLoading: false,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      // If token is invalid or request fails, we logout the user locally
      await _storage.delete(key: 'jwt_token');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      final data = response.data;
      final token = data['token'];
      final user = User.fromJson(data['user'] ?? data['data']);

      await _storage.write(key: 'jwt_token', value: token);
      _dio.options.headers['Authorization'] = 'Bearer $token';

      state = state.copyWith(
        user: user,
        token: token,
        isLoading: false,
      );
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? e.message ?? 'Login failed';
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'An unexpected error occurred.');
    }
  }

  Future<void> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _dio.post('/auth/register', data: data);
      
      final resData = response.data;
      final token = resData['token'];
      final user = User.fromJson(resData['user'] ?? resData['data']);

      await _storage.write(key: 'jwt_token', value: token);
      _dio.options.headers['Authorization'] = 'Bearer $token';

      state = state.copyWith(
        user: user,
        token: token,
        isLoading: false,
      );
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? e.message ?? 'Registration failed';
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'An unexpected error occurred.');
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await _storage.delete(key: 'jwt_token');
      _dio.options.headers.remove('Authorization');
      state = const AuthState(); // Reset state
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
