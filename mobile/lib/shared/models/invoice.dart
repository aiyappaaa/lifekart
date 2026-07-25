class Invoice {
  final String id;
  final String householdId;
  final String invoiceNumber;
  final double amountDue;
  final double amountPaid;
  final String status;
  final DateTime dueDate;
  final DateTime? paidAt;

  const Invoice({
    required this.id,
    required this.householdId,
    required this.invoiceNumber,
    required this.amountDue,
    required this.amountPaid,
    required this.status,
    required this.dueDate,
    this.paidAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as String,
      householdId: json['householdId'] as String,
      invoiceNumber: json['invoiceNumber'] as String,
      amountDue: (json['amountDue'] as num).toDouble(),
      amountPaid: (json['amountPaid'] as num).toDouble(),
      status: json['status'] as String,
      dueDate: DateTime.parse(json['dueDate'] as String),
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'householdId': householdId,
      'invoiceNumber': invoiceNumber,
      'amountDue': amountDue,
      'amountPaid': amountPaid,
      'status': status,
      'dueDate': dueDate.toIso8601String(),
      'paidAt': paidAt?.toIso8601String(),
    };
  }
}
