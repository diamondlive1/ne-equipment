import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuoteItem {
  product: { name: string; image?: string };
  quantity: number;
  approved_price?: number;
  requested_price?: number;
}

interface QuoteData {
  quote_number: string;
  created_at: string;
  status: string;
  items: QuoteItem[];
  user: { name: string; email: string };
  company_name?: string;
  company_nif?: string;
  total_estimated_value: number;
}

interface Settings {
  bank_1_name?: string;
  bank_1_account?: string;
  bank_1_nib?: string;
  bank_2_name?: string;
  bank_2_account?: string;
  bank_2_nib?: string;
}

export const generateQuotePDF = (quote: QuoteData, settings: Settings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const subtotal = quote.items.reduce((sum, item) => {
    const price = item.approved_price || item.requested_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const html = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <title>Cotação ${quote.quote_number}</title>
      <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1a1a1a; margin: 0; padding: 40px; line-height: 1.4; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #EAB308; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-section { flex: 1; }
        .logo-box { background: #1a1a1a; color: #EAB308; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; border: 2px solid #EAB308; margin-bottom: 10px; }
        .company-info { font-size: 10px; text-align: center; flex: 1; }
        .contacts-info { font-size: 10px; text-align: right; flex: 1; }
        
        .invoice-title { text-align: right; margin-bottom: 30px; }
        .invoice-title h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #1a1a1a; }
        .invoice-title p { margin: 5px 0 0; font-size: 14px; color: #666; }

        .client-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .client-info { flex: 1; }
        .client-info h2 { font-size: 16px; margin: 0 0 10px; text-transform: uppercase; }
        .client-info p { margin: 2px 0; font-size: 12px; }
        
        .ref-box { flex: 1; display: flex; flex-direction: column; align-items: flex-end; }
        .ref-table { border-collapse: collapse; font-size: 10px; }
        .ref-table th { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 5px 10px; text-align: left; }
        .ref-table td { border: 1px solid #e5e7eb; padding: 5px 10px; }

        table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 11px; }
        table.items-table th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; }
        table.items-table td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .footer-grid { display: flex; gap: 40px; margin-top: 20px; }
        .notes-section { flex: 1; }
        .notes-box { border: 1px solid #e5e7eb; padding: 15px; min-height: 80px; font-size: 10px; color: #666; margin-top: 10px; }
        
        .totals-section { width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; }
        .total-row.grand-total { border-top: 2px solid #1a1a1a; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 14px; color: #1a1a1a; }
        
        .bank-details { margin-top: 50px; padding-top: 20px; border-top: 1px dashed #e5e7eb; font-size: 10px; color: #444; }
        .bank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
        .bank-item { background: #f9fafb; padding: 10px; border-radius: 4px; }

        @media print {
          button { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <div class="logo-box">NE</div>
          <div style="font-size: 12px; font-weight: bold;">EQUIPMENT</div>
        </div>
        <div class="company-info">
          <p style="font-weight: bold; margin-bottom: 5px;">NE EQUIPMENT LDA</p>
          <p>Av. Vlademir Lenine 2114, 1. andar, Esquerdo</p>
        </div>
        <div class="contacts-info">
          <p>872574001</p>
          <p>sales@neequipment.co.mz</p>
          <p>Nuit: 400899312</p>
        </div>
      </div>

      <div class="invoice-title">
        <h1>Factura / Cotação</h1>
        <p># ${quote.quote_number}</p>
      </div>

      <div class="client-section">
        <div class="client-info">
          <h2>${quote.company_name || quote.user.name}</h2>
          <p>Email: ${quote.user.email}</p>
          ${quote.company_nif ? `<p>Nuit: ${quote.company_nif}</p>` : ''}
          <p>Status: ${quote.status.toUpperCase()}</p>
        </div>
        <div class="ref-box">
          <table class="ref-table">
            <tr>
              <th>V/ Referência:</th>
              <th>D. Emissão</th>
              <th>D. Vencimento</th>
            </tr>
            <tr>
              <td>${quote.quote_number}</td>
              <td>${format(new Date(quote.created_at), 'dd-MM-yyyy')}</td>
              <td>${format(new Date(new Date(quote.created_at).getTime() + 7 * 24 * 60 * 60 * 1000), 'dd-MM-yyyy')}</td>
            </tr>
          </table>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th class="text-center">Quant.</th>
            <th class="text-right">Preço (MZN)</th>
            <th class="text-center">IVA</th>
            <th class="text-right">Total (MZN)</th>
          </tr>
        </thead>
        <tbody>
          ${quote.items.map(item => {
            const price = item.approved_price || item.requested_price || 0;
            const subtotal = price * item.quantity;
            const itemIva = subtotal * 0.16;
            const itemTotal = subtotal + itemIva;
            return `
              <tr>
                <td>${item.product.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${price.toLocaleString('pt-MZ')}</td>
                <td class="text-center">${itemIva.toLocaleString('pt-MZ')}</td>
                <td class="text-right">${itemTotal.toLocaleString('pt-MZ')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer-grid">
        <div class="notes-section">
          <strong>Notas:</strong>
          <div class="notes-box">
            Válido por 7 dias. Pagamento via transferência bancária.
          </div>
        </div>
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal (MZN)</span>
            <span>${subtotal.toLocaleString('pt-MZ')}</span>
          </div>
          <div class="total-row">
            <span>IVA (16%)</span>
            <span>${iva.toLocaleString('pt-MZ')}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total do documento</span>
            <span>${total.toLocaleString('pt-MZ')} MT</span>
          </div>
        </div>
      </div>

      <div class="bank-details">
        <strong>COORDENADAS BANCÁRIAS PARA PAGAMENTO:</strong>
        <div class="bank-grid">
          ${settings.bank_1_name ? `
            <div class="bank-item">
              <p><strong>${settings.bank_1_name}</strong></p>
              <p>Conta: ${settings.bank_1_account}</p>
              <p>NIB/IBAN: ${settings.bank_1_nib}</p>
            </div>
          ` : ''}
          ${settings.bank_2_name ? `
            <div class="bank-item">
              <p><strong>${settings.bank_2_name}</strong></p>
              <p>Conta: ${settings.bank_2_account}</p>
              <p>NIB/IBAN: ${settings.bank_2_nib}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            // window.close(); // Optional: close window after printing
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
