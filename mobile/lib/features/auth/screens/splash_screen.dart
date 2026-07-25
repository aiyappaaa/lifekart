import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthentication();
  }

  Future<void> _checkAuthentication() async {
    // Wait for the animation to complete
    await Future.delayed(const Duration(milliseconds: 2000));
    
    // Check authentication state
    await ref.read(authProvider.notifier).checkAuth();

    if (!mounted) return;
    
    final authState = ref.read(authProvider);
    if (authState.user != null) {
      // Direct to dashboard (role based routing could be handled here or inside dashboard)
      context.go('/dashboard');
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.shopping_bag_rounded,
              size: 100,
              color: Color(0xFFFF5A0A),
            )
            .animate()
            .scale(duration: 800.ms, curve: Curves.easeOutBack)
            .fadeIn(duration: 800.ms),
            
            const SizedBox(height: 24),
            
            const Text(
              'LifeKart',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 40,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFF5A0A),
              ),
            )
            .animate()
            .fade(delay: 400.ms, duration: 800.ms)
            .slideY(begin: 0.5, end: 0, duration: 800.ms, curve: Curves.easeOutCubic),
          ],
        ),
      ),
    );
  }
}
