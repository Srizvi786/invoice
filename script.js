// Global variables
let items = [];
let nextItemId = 1;
let currencySymbol = '₹'; // Default currency symbol

// DOM ready event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs and dropdowns
    initTabs();
    
    // Set current date for invoice
    document.getElementById('invoice-date').valueAsDate = new Date();
    
    // Add event listeners
    document.getElementById('add-item-btn').addEventListener('click', addNewItem);
    document.getElementById('preview-invoice-btn').addEventListener('click', previewInvoice);
    document.getElementById('generate-invoice-btn').addEventListener('click', generateInvoice);
    document.getElementById('save-invoice-btn').addEventListener('click', saveInvoice);
    document.getElementById('print-invoice-btn').addEventListener('click', printInvoice);
    document.getElementById('upload-logo-btn').addEventListener('click', function() {
        document.getElementById('logo-upload').click();
    });
    document.getElementById('logo-upload').addEventListener('change', handleLogoUpload);
    
    // Add event listeners for discount calculations
    document.getElementById('discount-type').addEventListener('change', calculateTotals);
    document.getElementById('discount-value').addEventListener('input', calculateTotals);
    
    // Add event listener for currency change
    document.getElementById('currency').addEventListener('change', function() {
        currencySymbol = this.value;
        updateCurrencyDisplay();
        calculateTotals();
    });
    
    // Add first item row by default
    addNewItem();
});

// Initialize tabs and dropdowns
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const dropdown = document.getElementById(`${tabId}-dropdown`);
            
            // Toggle active class for clicked tab
            this.classList.toggle('active');
            
            // Toggle dropdown visibility
            if (dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            } else {
                dropdown.classList.add('active');
            }
        });
    });
    
    // Open first tab by default
    tabs[0].click();
}

// Handle logo upload
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logo-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Add new item row
function addNewItem() {
    const itemsBody = document.getElementById('items-body');
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-item-id', nextItemId);
    
    newRow.innerHTML = `
        <td>${nextItemId}</td>
        <td><input type="text" class="item-description" placeholder="Item description"></td>
        <td><input type="number" class="item-quantity" value="1" min="1"></td>
        <td><div class="rate-input-group"><span class="currency-symbol">${currencySymbol}</span><input type="number" class="item-rate" value="0" min="0"></div></td>
        <td><input type="number" class="item-gst" value="18" min="0" max="28"></td>
        <td><div class="amount-display"><span class="currency-symbol">${currencySymbol}</span><input type="text" class="item-amount" value="0" readonly></div></td>
        <td class="item-actions">
            <button class="delete-item-btn"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    itemsBody.appendChild(newRow);
    
    // Add event listeners to new row
    const quantityInput = newRow.querySelector('.item-quantity');
    const rateInput = newRow.querySelector('.item-rate');
    const gstInput = newRow.querySelector('.item-gst');
    const deleteBtn = newRow.querySelector('.delete-item-btn');
    
    quantityInput.addEventListener('input', function() {
        updateItemAmount(newRow);
    });
    
    rateInput.addEventListener('input', function() {
        updateItemAmount(newRow);
    });
    
    gstInput.addEventListener('input', function() {
        updateItemAmount(newRow);
    });
    
    deleteBtn.addEventListener('click', function() {
        deleteItem(newRow);
    });
    
    // Add item to items array
    items.push({
        id: nextItemId,
        description: '',
        quantity: 1,
        rate: 0,
        gst: 18,
        amount: 0
    });
    
    nextItemId++;
}

// Update currency display throughout the form
function updateCurrencyDisplay() {
    // Update all rate and amount fields in the items table
    const itemRows = document.querySelectorAll('#items-body tr');
    itemRows.forEach(row => {
        updateItemAmount(row);
    });
    
    // Update totals section
    calculateTotals();
}

// Update item amount
function updateItemAmount(row) {
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    const amount = quantity * rate;
    
    row.querySelector('.item-amount').value = amount.toFixed(2);
    
    // Update item in items array
    const itemId = parseInt(row.getAttribute('data-item-id'));
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        items[itemIndex].description = row.querySelector('.item-description').value;
        items[itemIndex].quantity = quantity;
        items[itemIndex].rate = rate;
        items[itemIndex].gst = parseFloat(row.querySelector('.item-gst').value) || 0;
        items[itemIndex].amount = amount;
    }
    
    // Recalculate totals
    calculateTotals();
}

// Delete item
function deleteItem(row) {
    const itemId = parseInt(row.getAttribute('data-item-id'));
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
    }
    
    row.remove();
    calculateTotals();
}

// Calculate totals
function calculateTotals() {
    let subtotal = 0;
    let totalGst = 0;
    
    // Calculate subtotal
    items.forEach(item => {
        subtotal += item.amount;
        totalGst += (item.amount * item.gst / 100);
    });
    
    // Calculate discount
    const discountType = document.getElementById('discount-type').value;
    const discountValue = parseFloat(document.getElementById('discount-value').value) || 0;
    let discountAmount = 0;
    
    if (discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100);
    } else {
        discountAmount = discountValue;
    }
    
    // Calculate total
    const totalAmount = subtotal - discountAmount + totalGst;
    
    // Update totals in form
    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('discount-amount').value = discountAmount.toFixed(2);
    document.getElementById('tax-amount').value = totalGst.toFixed(2);
    document.getElementById('total-amount').value = totalAmount.toFixed(2);
}

// Preview invoice
function previewInvoice() {
    const previewContainer = document.getElementById('invoice-preview');
    previewContainer.classList.add('active');
    
    // Get company details
    const companyName = document.getElementById('company-name').value || 'Company Name';
    const companyAddress = document.getElementById('company-address').value || 'Company Address';
    const companyPhone = document.getElementById('company-phone').value || '';
    const companyEmail = document.getElementById('company-email').value || '';
    const companyGst = document.getElementById('company-gst').value || '';
    
    // Get client details
    const clientName = document.getElementById('client-name').value || 'Client Name';
    const clientAddress = document.getElementById('client-address').value || 'Client Address';
    const clientPhone = document.getElementById('client-phone').value || '';
    const clientEmail = document.getElementById('client-email').value || '';
    const clientGst = document.getElementById('client-gst').value || '';
    
    // Get invoice details
    const invoiceNumber = document.getElementById('invoice-number').value || 'INV-001';
    const invoiceDate = document.getElementById('invoice-date').value || '';
    const dueDate = document.getElementById('due-date').value || '';
    
    // Get totals
    const subtotal = document.getElementById('subtotal').value || '0.00';
    const discountAmount = document.getElementById('discount-amount').value || '0.00';
    const taxAmount = document.getElementById('tax-amount').value || '0.00';
    const totalAmount = document.getElementById('total-amount').value || '0.00';
    
    // Get notes
    const termsConditions = document.getElementById('terms-conditions').value || '';
    const paymentInfo = document.getElementById('payment-info').value || '';
    const additionalNotes = document.getElementById('additional-notes').value || '';
    
    // Generate invoice HTML
    let invoiceHtml = `
        <div class="invoice-header">
            <div class="invoice-logo">
                <img src="${document.getElementById('logo-preview').src}" alt="Company Logo">
            </div>
            <div class="invoice-title">
                <h2>INVOICE</h2>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> ${formatDate(invoiceDate)}</p>
                <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
            </div>
        </div>
        
        <div class="invoice-addresses">
            <div class="from-address">
                <h3>From:</h3>
                <p><strong>${companyName}</strong></p>
                <p>${companyAddress}</p>
                <p>${companyPhone}</p>
                <p>${companyEmail}</p>
                <p><strong>GST:</strong> ${companyGst}</p>
            </div>
            <div class="to-address">
                <h3>To:</h3>
                <p><strong>${clientName}</strong></p>
                <p>${clientAddress}</p>
                <p>${clientPhone}</p>
                <p>${clientEmail}</p>
                <p><strong>GST:</strong> ${clientGst}</p>
            </div>
        </div>
        
        <div class="invoice-items">
            <table>
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>GST %</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add items to invoice
    items.forEach((item, index) => {
        invoiceHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.description || 'Item Description'}</td>
                <td>${item.quantity}</td>
                <td>${currencySymbol}${item.rate.toFixed(2)}</td>
                <td>${item.gst}%</td>
                <td>${currencySymbol}${item.amount.toFixed(2)}</td>
            </tr>
        `;
    });
    
    invoiceHtml += `
                </tbody>
            </table>
        </div>
        
        <div class="invoice-totals">
            <div class="totals-table">
                <div class="totals-row">
                    <div class="totals-label">Subtotal:</div>
                    <div class="totals-value">${currencySymbol}${subtotal}</div>
                </div>
                <div class="totals-row">
                    <div class="totals-label">Discount:</div>
                    <div class="totals-value">${currencySymbol}${discountAmount}</div>
                </div>
                <div class="totals-row">
                    <div class="totals-label">GST Amount:</div>
                    <div class="totals-value">${currencySymbol}${taxAmount}</div>
                </div>
                <div class="totals-row total">
                    <div class="totals-label">Total Amount:</div>
                    <div class="totals-value">${currencySymbol}${totalAmount}</div>
                </div>
            </div>
        </div>
        
        <div class="invoice-notes">
            ${termsConditions ? `<div class="note-section">
                <h4>Terms and Conditions:</h4>
                <p>${termsConditions}</p>
            </div>` : ''}
            
            ${paymentInfo ? `<div class="note-section">
                <h4>Payment Information:</h4>
                <p>${paymentInfo}</p>
            </div>` : ''}
            
            ${additionalNotes ? `<div class="note-section">
                <h4>Additional Notes:</h4>
                <p>${additionalNotes}</p>
            </div>` : ''}
        </div>
    `;
    
    // Add invoice CSS
    const invoiceStyles = `
        <style>
            .invoice-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            
            .invoice-logo img {
                max-width: 150px;
                max-height: 150px;
            }
            
            .invoice-title {
                text-align: right;
            }
            
            .invoice-addresses {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            
            .from-address, .to-address {
                width: 48%;
            }
            
            .invoice-items table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            
            .invoice-items th, .invoice-items td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .invoice-items th {
                background-color: #f5f5f5;
            }
            
            .invoice-totals {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 30px;
            }
            
            .totals-table {
                width: 300px;
            }
            
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
            }
            
            .totals-row.total {
                font-weight: bold;
                font-size: 1.2em;
                border-top: 2px solid #333;
                padding-top: 10px;
            }
            
            .invoice-notes {
                margin-top: 30px;
            }
            
            .note-section {
                margin-bottom: 20px;
            }
            
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .invoice-preview, .invoice-preview * {
                    visibility: visible;
                }
                
                .invoice-preview {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        </style>
    `;
    
    previewContainer.innerHTML = invoiceStyles + invoiceHtml;
    
    // Scroll to preview
    previewContainer.scrollIntoView({ behavior: 'smooth' });
}

// Generate invoice for download
function generateInvoice() {
    // First preview the invoice
    previewInvoice();
    
    // Then prepare for download
    const invoiceNumber = document.getElementById('invoice-number').value || 'INV-001';
    const clientName = document.getElementById('client-name').value || 'client';
    const fileName = `Invoice_${invoiceNumber}_${clientName}.html`;
    
    // Get the HTML content
    const invoiceContent = document.getElementById('invoice-preview').innerHTML;
    
    // Create a Blob with the HTML content
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${invoiceNumber}</title></head><body>${invoiceContent}</body></html>`], { type: 'text/html' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Save invoice data
function saveInvoice() {
    // Collect all form data
    const invoiceData = {
        company: {
            name: document.getElementById('company-name').value,
            address: document.getElementById('company-address').value,
            phone: document.getElementById('company-phone').value,
            email: document.getElementById('company-email').value,
            gst: document.getElementById('company-gst').value,
            logo: document.getElementById('logo-preview').src
        },
        client: {
            name: document.getElementById('client-name').value,
            address: document.getElementById('client-address').value,
            phone: document.getElementById('client-phone').value,
            email: document.getElementById('client-email').value,
            gst: document.getElementById('client-gst').value
        },
        invoice: {
            number: document.getElementById('invoice-number').value,
            date: document.getElementById('invoice-date').value,
            dueDate: document.getElementById('due-date').value
        },
        items: items,
        totals: {
            subtotal: document.getElementById('subtotal').value,
            discountType: document.getElementById('discount-type').value,
            discountValue: document.getElementById('discount-value').value,
            discountAmount: document.getElementById('discount-amount').value,
            taxAmount: document.getElementById('tax-amount').value,
            totalAmount: document.getElementById('total-amount').value
        },
        notes: {
            termsConditions: document.getElementById('terms-conditions').value,
            paymentInfo: document.getElementById('payment-info').value,
            additionalNotes: document.getElementById('additional-notes').value
        }
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(invoiceData, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${invoiceData.invoice.number}_data.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Invoice data saved successfully!');
}

// Print invoice
function printInvoice() {
    // First preview the invoice
    previewInvoice();
    
    // Then print
    window.print();
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
}
