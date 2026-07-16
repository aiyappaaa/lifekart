import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/auth_provider.dart';
import '../../features/auth/login_screen.dart';
import '../../features/customer/customer_dashboard.dart';
import '../../features/superadmin/superadmin_dashboard.dart';
import '../../features/corporate/corporate_dashboard.dart';
import '../../features/manufacturer/manufacturer_dashboard.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login';

      if (!isLoggedIn) {
        return isLoggingIn ? null : '/login';
      }

      if (isLoggingIn && isLoggedIn) {
        // Redirect based on role
        switch (authState.role) {
          case 'CUSTOMER':
            return '/customer';
          case 'SUPERADMIN':
            return '/superadmin';
          case 'CORPORATE_ADMIN':
            return '/corporate';
          case 'MANUFACTURER':
            return '/manufacturer';
          default:
            return '/login';
        }
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/customer',
        builder: (context, state) => const CustomerDashboard(),
      ),
      GoRoute(
        path: '/superadmin',
        builder: (context, state) => const SuperadminDashboard(),
      ),
      GoRoute(
        path: '/corporate',
        builder: (context, state) => const CorporateDashboard(),
      ),
      GoRoute(
        path: '/manufacturer',
        builder: (context, state) => const ManufacturerDashboard(),
      ),
    ],
  );
});
