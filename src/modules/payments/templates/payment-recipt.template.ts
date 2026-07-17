import { PaymentDetailsDto } from 'src/common/dto/payment.dto';

export function buildPaymentReciptHtml(
  data: PaymentDetailsDto,
): string {
  const formattedPaymentDate = new Date(data.paymentDate).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const directionColor: Record<string, string> = {
    RECEIVED: 'bg-green-100 text-green-700',
    MADE: 'bg-blue-100 text-blue-700',
  };

  const methodColor: Record<string, string> = {
    CASH: 'bg-emerald-100 text-emerald-700',
    BANK_TRANSFER: 'bg-blue-100 text-blue-700',
    CARD: 'bg-purple-100 text-purple-700',
    CHEQUE: 'bg-amber-100 text-amber-700',
  };

  const directionClass =
    directionColor[data.paymentDirection] || 'bg-gray-100 text-gray-700';

  const methodClass =
    methodColor[data.paymentMethod] || 'bg-gray-100 text-gray-700';

  const invoiceStatusColor: Record<string, string> = {
    UNPAID: 'bg-red-100 text-red-700',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };

  const poStatusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    RECEIVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const paymentStatusColor: Record<string, string> = {
    UNPAID: 'bg-red-100 text-red-700',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
  };

  const directionLabel =
    data.paymentDirection === 'RECEIVED' ? 'Payment Received' : 'Payment Made';

  const entityLabel =
    data.paymentDirection === 'RECEIVED' ? 'Received From' : 'Paid To';

  const relatedDocHtml = data.relatedInvoice
    ? `
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Related Invoice</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-1">
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Invoice No.</span> <span class="font-semibold">${data.relatedInvoice.invoiceNumber}</span></p>
          <p class="text-sm">
            <span class="text-gray-500 w-28 inline-block">Status:</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold ${invoiceStatusColor[data.relatedInvoice.status] || 'bg-gray-100 text-gray-700'}">${data.relatedInvoice.status}</span>
          </p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Issue Date:</span> <span class="font-medium">${new Date(data.relatedInvoice.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Due Date:</span> <span class="font-medium">${new Date(data.relatedInvoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Total:</span> <span class="font-semibold">${formatCurrency(data.relatedInvoice.totalAmount)}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Paid:</span> <span class="font-medium text-green-600">${formatCurrency(data.relatedInvoice.paidAmount)}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Balance:</span> <span class="font-medium text-red-600">${formatCurrency(data.relatedInvoice.balanceAmount)}</span></p>
        </div>
      </div>`
    : data.relatedPurchaseOrder
      ? `
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Related Purchase Order</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-1">
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">PO No.</span> <span class="font-semibold">${data.relatedPurchaseOrder.purchaseOrderNumber}</span></p>
          <p class="text-sm">
            <span class="text-gray-500 w-28 inline-block">Status:</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold ${poStatusColor[data.relatedPurchaseOrder.status] || 'bg-gray-100 text-gray-700'}">${data.relatedPurchaseOrder.status}</span>
          </p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Total:</span> <span class="font-semibold">${formatCurrency(data.relatedPurchaseOrder.totalAmount)}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Paid:</span> <span class="font-medium text-green-600">${formatCurrency(data.relatedPurchaseOrder.paidAmount)}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Balance:</span> <span class="font-medium text-red-600">${formatCurrency(data.relatedPurchaseOrder.balanceAmount)}</span></p>
        </div>
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body class="bg-white text-gray-800">
  <div class="max-w-[800px] mx-auto p-8">

    <!-- Header -->
    <div class="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-800">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">PAYMENT RECEIPT</h1>
        <p class="text-sm text-gray-500 mt-1">${directionLabel}</p>
      </div>
      <div class="text-right">
        <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${directionClass}">
          ${data.paymentDirection}
        </div>
        <p class="text-sm text-gray-600 mt-2">
          <span class="text-gray-400">Payment No.</span><br />
          <span class="font-semibold text-gray-900">${data.paymentNumber}</span>
        </p>
      </div>
    </div>

    <!-- Payment Info & Method -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-1">
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Payment Date:</span> <span class="font-medium">${formattedPaymentDate}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Amount:</span> <span class="font-semibold text-lg">${formatCurrency(data.amount)}</span></p>
          <p class="text-sm">
            <span class="text-gray-500 w-28 inline-block">Method:</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold ${methodClass}">${data.paymentMethod.replace('_', ' ')}</span>
          </p>
          ${data.transactionId ? `<p class="text-sm"><span class="text-gray-500 w-28 inline-block">Transaction ID:</span> <span class="font-medium">${data.transactionId}</span></p>` : ''}
        </div>
      </div>
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">${entityLabel}</h3>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="font-semibold text-gray-900 mb-1">${data.entityInformation.name}</p>
          ${data.entityInformation.email ? `<p class="text-sm text-gray-600">${data.entityInformation.email}</p>` : ''}
          ${data.entityInformation.phone ? `<p class="text-sm text-gray-600">${data.entityInformation.phone}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Related Document -->
    ${relatedDocHtml ? `<div class="mb-8">${relatedDocHtml}</div>` : ''}

    <!-- Payment Summary -->
    <div class="mb-8">
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Summary</h3>
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-800 text-white">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider w-40">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-white">
              <td class="px-4 py-3 text-sm text-gray-900 font-medium border-b border-gray-200">${directionLabel}</td>
              <td class="px-4 py-3 text-sm text-gray-900 font-semibold text-right border-b border-gray-200">${formatCurrency(data.amount)}</td>
            </tr>
            ${data.relatedInvoice ? `
            <tr class="bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">Invoice Balance</td>
              <td class="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-200">${formatCurrency(data.relatedInvoice.balanceAmount)}</td>
            </tr>` : ''}
            ${data.relatedPurchaseOrder ? `
            <tr class="bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">Purchase Order Balance</td>
              <td class="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-200">${formatCurrency(data.relatedPurchaseOrder.balanceAmount)}</td>
            </tr>` : ''}
          </tbody>
          <tfoot>
            <tr class="bg-gray-800 text-white">
              <td class="px-4 py-3 text-sm font-bold uppercase tracking-wider">Total Payment</td>
              <td class="px-4 py-3 text-base font-bold text-right">${formatCurrency(data.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-12 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-2 gap-8">
        <div>
          <p class="text-xs text-gray-400 mb-8">Authorized Signature</p>
          <div class="border-t border-gray-300 pt-2">
            <p class="text-sm text-gray-500">Date: _______________</p>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-8">Received By</p>
          <div class="border-t border-gray-300 pt-2">
            <p class="text-sm text-gray-500">Date: _______________</p>
          </div>
        </div>
      </div>
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-400">This is a computer-generated document. No signature is required.</p>
        <p class="text-xs text-gray-400 mt-1">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>

  </div>
</body>
</html>`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}
