import { SalesOrderDetailsResponseDto } from 'src/common/dto/sales-order.dto';

export function buildSalesOrderHtml(
  data: SalesOrderDetailsResponseDto,
): string {
  const formattedDate = new Date(data.orderDate).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const statusClass =
    statusColor[data.orderStatus] || 'bg-gray-100 text-gray-700';

  const itemsRows = data.items
    .map(
      (item, index) => `
      <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">${index + 1}</td>
        <td class="px-4 py-3 text-sm text-gray-900 font-medium border-b border-gray-200">${item.productName}</td>
        <td class="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200">${item.quantity}</td>
        <td class="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-200">${formatCurrency(item.unitPrice)}</td>
        <td class="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-200">${formatCurrency(item.discount)}</td>
        <td class="px-4 py-3 text-sm text-gray-900 font-medium text-right border-b border-gray-200">${formatCurrency(item.totalPrice)}</td>
      </tr>`,
    )
    .join('');

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
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">SALES ORDER</h1>
        <p class="text-sm text-gray-500 mt-1">Order Document</p>
      </div>
      <div class="text-right">
        <div class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
          ${data.orderStatus}
        </div>
        <p class="text-sm text-gray-600 mt-2">
          <span class="text-gray-400">Order No.</span><br />
          <span class="font-semibold text-gray-900">${data.salesOrderNumber}</span>
        </p>
      </div>
    </div>

    <!-- Order Info -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Details</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-1">
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Order Date:</span> <span class="font-medium">${formattedDate}</span></p>
          <p class="text-sm">
            <span class="text-gray-500 w-28 inline-block">Status:</span>
            <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusClass}">${data.orderStatus}</span>
          </p>
        </div>
      </div>
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-1">
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Total Amount:</span> <span class="font-semibold">${formatCurrency(data.totalAmount)}</span></p>
          <p class="text-sm"><span class="text-gray-500 w-28 inline-block">Items:</span> <span class="font-medium">${data.items.length}</span></p>
        </div>
      </div>
    </div>

    <!-- Customer & Warehouse Info -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer Information</h3>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="font-semibold text-gray-900 mb-1">${data.customerInfo.customerName}</p>
          ${data.customerInfo.customerEmail ? `<p class="text-sm text-gray-600">${data.customerInfo.customerEmail}</p>` : ''}
          ${data.customerInfo.customerPhone ? `<p class="text-sm text-gray-600">${data.customerInfo.customerPhone}</p>` : ''}
        </div>
      </div>
      <div>
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Warehouse Information</h3>
        <div class="border border-gray-200 rounded-lg p-4">
          <p class="font-semibold text-gray-900 mb-1">${data.warehouseInfo.warehouseName}</p>
          ${data.warehouseInfo.warehouseContactPerson ? `<p class="text-sm text-gray-600">${data.warehouseInfo.warehouseContactPerson}</p>` : ''}
          ${data.warehouseInfo.warehousePhone ? `<p class="text-sm text-gray-600">${data.warehouseInfo.warehousePhone}</p>` : ''}
          ${data.warehouseInfo.warehouseAddress ? `<p class="text-sm text-gray-600 mt-1">${data.warehouseInfo.warehouseAddress}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="mb-8">
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Items</h3>
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-800 text-white">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-12">#</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-20">Qty</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider w-28">Unit Price</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider w-24">Discount</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr class="bg-gray-800 text-white">
              <td colspan="5" class="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider">Total Amount</td>
              <td class="px-4 py-3 text-right text-base font-bold">${formatCurrency(data.totalAmount)}</td>
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
