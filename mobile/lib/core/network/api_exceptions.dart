import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException(this.message, {this.statusCode, this.data});

  factory ApiException.fromDioError(DioException error) {
    int? code = error.response?.statusCode;
    dynamic data = error.response?.data;
    String message = data?['message'] ?? error.message ?? 'Unknown error occurred';

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return NetworkException(message);
    }

    if (code == 401) {
      return UnauthorizedException(message, data: data);
    }
    if (code == 403) {
      return UnauthorizedException(message, data: data);
    }
    if (code == 404) {
      return NotFoundException(message, data: data);
    }
    if (code == 422 || code == 400) {
      Map<String, dynamic> errors = {};
      if (data is Map && data['errors'] is Map) {
        errors = Map<String, dynamic>.from(data['errors']);
      }
      return ValidationException(message, errors, data: data);
    }
    if (code != null && code >= 500) {
      return ServerException(message, statusCode: code, data: data);
    }

    return ApiException(message, statusCode: code, data: data);
  }

  @override
  String toString() => 'ApiException: $message';
}

class UnauthorizedException extends ApiException {
  UnauthorizedException(super.message, {super.data}) : super(statusCode: 401);
}

class NotFoundException extends ApiException {
  NotFoundException(super.message, {super.data}) : super(statusCode: 404);
}

class ValidationException extends ApiException {
  final Map<String, dynamic> errors;
  ValidationException(super.message, this.errors, {super.data}) : super(statusCode: 422);
}

class ServerException extends ApiException {
  ServerException(super.message, {super.statusCode, super.data});
}

class NetworkException extends ApiException {
  NetworkException(super.message) : super(statusCode: 0);
}
