class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';
  static const String google = '/auth/google';
  static const String logout = '/auth/logout';

  // Profiling
  static const String households = '/profiling/households';
  static const String members = '/profiling/members';

  // Catalog
  static const String categories = '/catalog/categories';
  static const String products = '/catalog/products';
  static const String manufacturers = '/catalog/manufacturers';
  static const String substitutes = '/catalog/substitutes';
  static const String catalogProgressionRules = '/catalog/progression-rules';

  // Calculator
  static const String calculate = '/calculator/calculate';
  static const String subscriptions = '/calculator/subscriptions';
  static String subscriptionPause(String id) => '/calculator/subscriptions/$id/pause';
  static String subscriptionResume(String id) => '/calculator/subscriptions/$id/resume';

  // Agreements
  static const String agreements = '/agreements';
  static String agreementSign(String id) => '/agreements/$id/sign';
  static String agreementCancel(String id) => '/agreements/$id/cancel';

  // Scheduling
  static const String deliveries = '/scheduling/deliveries';
  static const String calendar = '/scheduling/calendar';
  static const String trigger = '/scheduling/trigger';

  // Payments
  static const String setupIntent = '/payments/setup-intent';
  static const String paymentIntent = '/payments/payment-intent';
  static const String transactions = '/payments/transactions';
  static const String invoices = '/payments/invoices';
  static const String webhook = '/payments/webhook';

  // Gifting
  static const String gifts = '/gifting/gifts';
  static String giftClaim(String id) => '/gifting/gifts/$id/claim';
  static String giftActivate(String id) => '/gifting/gifts/$id/activate';
  static const String giftsReceived = '/gifting/received';
  static const String giftsPublic = '/gifting/public';

  // Corporate
  static const String partners = '/corporate/partners';
  static String partnerApprove(String id) => '/corporate/partners/$id/approve';
  static String partnerSuspend(String id) => '/corporate/partners/$id/suspend';
  static const String employees = '/corporate/employees';

  // Payroll
  static const String deductions = '/payroll/deductions';
  static const String deductionsProcess = '/payroll/process';
  static const String deductionsBulk = '/payroll/bulk';

  // Health
  static const String healthProfiles = '/health/profiles';
  static const String healthTransitions = '/health/transitions';

  // Legacy
  static const String nominees = '/legacy/nominees';
  static const String verifyDeath = '/legacy/verify-death';
  static const String publicClaim = '/legacy/public-claim';
  static String activationApprove(String id) => '/legacy/activations/$id/approve';
  static String activationReject(String id) => '/legacy/activations/$id/reject';

  // Analytics
  static const String analyticsPublicConfig = '/analytics/public-config';
  static const String analyticsLandingStats = '/analytics/landing-stats';
  static const String analyticsKpiSavings = '/analytics/kpi-savings';
  static const String analyticsAdminMetrics = '/analytics/admin-metrics';
  static const String analyticsAdminTrend = '/analytics/admin-trend';

  // Community
  static const String communityConfig = '/community/config';
  static const String groups = '/community/groups';
  static String groupJoin(String id) => '/community/groups/$id/join';
  static String groupLeave(String id) => '/community/groups/$id/leave';
  static const String meGroups = '/community/me/groups';

  // Price Protection
  static const String ppSavings = '/price-protection/savings';
  static const String ppSubstitutions = '/price-protection/substitutions';
  static const String ppRules = '/price-protection/rules';
  static const String ppHistory = '/price-protection/history';
  static const String ppSubstitute = '/price-protection/substitute';

  // Manufacturer Portal
  static const String mpProfile = '/manufacturer-portal/profile';
  static const String mpAnalytics = '/manufacturer-portal/analytics';
  static const String mpProducts = '/manufacturer-portal/products';
  static const String mpProgressionRules = '/manufacturer-portal/progression-rules';

  // Config
  static const String configMetadata = '/config/metadata';
}
