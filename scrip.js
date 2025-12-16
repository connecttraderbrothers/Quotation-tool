// PDFShift API Configuration
const PDFSHIFT_API_KEY = 'sk_baa46c861371ec5f60ab2e83221fdac1ccce517b';

// Global variables
var items = [];
var currentRateType = 'job';
var estimateNumber = 1;

// Trade rates configuration
var tradeRates = {
    'Downtakings': { hourly: 30, daily: 220, job: 0 },
    'General Building': { hourly: 30, daily: 230, job: 0 },
    'Building work': { hourly: 30, daily: 230, job: 0 },
    'Carpentry': { hourly: 32, daily: 240, job: 0 },
    'Joinery': { hourly: 32, daily: 240, job: 0 },
    'Electrical': { hourly: 45, daily: 320, job: 200 },
    'Plumbing': { hourly: 45, daily: 300, job: 200 },
    'Gas work/Plumbing': { hourly: 50, daily: 340, job: 250 },
    'Plastering': { hourly: 30, daily: 240, job: 0 },
    'Skimming /Painting': { hourly: 28, daily: 220, job: 0 },
    'Painting & Decorating': { hourly: 28, daily: 220, job: 0 },
    'Tiling': { hourly: 32, daily: 250, job: 0 },
    'Roofing': { hourly: 35, daily: 260, job: 0 },
    'Kitchen Fitting': { hourly: 32, daily: 250, job: 3000 },
    'Bathroom Fitting': { hourly: 32, daily: 250, job: 2200 },
    'Bathrooms': { hourly: 32, daily: 250, job: 2200 },
    'Flooring': { hourly: 28, daily: 220, job: 0 },
    'Bricklaying': { hourly: 32, daily: 250, job: 0 },
    'HVAC': { hourly: 40, daily: 300, job: 0 },
    'Groundworks': { hourly: 30, daily: 230, job: 0 },
    'Scaffolding': { hourly: 0, daily: 200, job: 0 },
    'Glazing': { hourly: 32, daily: 250, job: 0 },
    'Insulation': { hourly: 28, daily: 220, job: 0 },
    'Materials': { hourly: 0, daily: 0, job: 0 }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('traderBrosEstimateCount')) {
        estimateNumber = parseInt(localStorage.getItem('traderBrosEstimateCount')) + 1;
    }
    updateEstimateCounter();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('clientName').addEventListener('input', function() {
        var name = this.value.trim();
        if (name) {
            var parts = name.split(' ');
            var customerId = '';
            
            if (parts.length >= 2) {
                var firstName = parts[0].substring(0, 3).toUpperCase();
                var lastName = parts[parts.length - 1].substring(0, 3).toUpperCase();
                var randomNum = Math.floor(1000 + Math.random() * 9000);
                customerId = firstName + lastName + randomNum;
            } else if (parts.length === 1) {
                var singleName = parts[0].substring(0, 6).toUpperCase();
                var randomNum = Math.floor(1000 + Math.random() * 9000);
                customerId = singleName + randomNum;
            }
            
            document.getElementById('customerId').value = customerId;
        } else {
            document.getElementById('customerId').value = '';
        }
    });

    document.getElementById('tradeCategory').addEventListener('change', function() {
        var selectedTrade = this.value;
        var rateInfo = document.getElementById('tradeRateInfo');
        
        if (selectedTrade && tradeRates[selectedTrade]) {
            var rates = tradeRates[selectedTrade];
            var infoText = 'Standard rates: ';
            var rateParts = [];
            
            if (rates.hourly > 0) rateParts.push('£' + rates.hourly + '/hr');
            if (rates.daily > 0) rateParts.push('£' + rates.daily + '/day');
            if (rates.job > 0) rateParts.push('£' + rates.job + '/job');
            
            if (rateParts.length > 0) {
                infoText += rateParts.join(' | ');
                rateInfo.textContent = infoText;
            } else {
                rateInfo.textContent = '';
            }
            
            updatePriceFromTrade();
        } else {
            rateInfo.textContent = '';
            document.getElementById('unitPrice').value = '';
        }
    });

    document.querySelectorAll('.rate-type-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.rate-type-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            currentRateType = this.getAttribute('data-type');
            
            var customUnitGroup = document.getElementById('customUnitGroup');
            var rateLabel = document.getElementById('rateLabel');
            
            if (currentRateType === 'custom') {
                customUnitGroup.classList.remove('hidden');
                rateLabel.textContent = 'Unit Price (£) *';
            } else if (currentRateType === 'daily') {
                customUnitGroup.classList.add('hidden');
                rateLabel.textContent = 'Day Rate (£) *';
            } else if (currentRateType === 'job') {
                customUnitGroup.classList.add('hidden');
                rateLabel.textContent = 'Per Job Rate (£) *';
            } else {
                customUnitGroup.classList.add('hidden');
                rateLabel.textContent = 'Hourly Rate (£) *';
            }
            
            updatePriceFromTrade();
        });
    });

    window.onclick = function(event) {
        var modal = document.getElementById('previewModal');
        if (event.target == modal) {
            closePreview();
        }
    };
}

function updateEstimateCounter() {
    document.getElementById('estimateCounter').textContent = '#' + String(estimateNumber).padStart(4, '0');
}

function updatePriceFromTrade() {
    var selectedTrade = document.getElementById('tradeCategory').value;
    if (selectedTrade && tradeRates[selectedTrade]) {
        var rates = tradeRates[selectedTrade];
        var price = 0;
        
        if (currentRateType === 'hourly' && rates.hourly > 0) {
            price = rates.hourly;
        } else if (currentRateType === 'daily' && rates.daily > 0) {
            price = rates.daily;
        } else if (currentRateType === 'job' && rates.job > 0) {
            price = rates.job;
        }
        
        if (price > 0) {
            document.getElementById('unitPrice').value = price;
        }
    }
}

function addItem() {
    var category = document.getElementById('tradeCategory').value || 'General';
    var description = document.getElementById('description').value;
    var quantity = parseFloat(document.getElementById('quantity').value);
    var unitPrice = parseFloat(document.getElementById('unitPrice').value);
    var customUnit = document.getElementById('customUnit').value;

    if (!description || !unitPrice || isNaN(unitPrice)) {
        alert('Please enter description and unit price');
        return;
    }

    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }

    var unit = '';
    if (currentRateType === 'hourly') {
        unit = 'hour';
    } else if (currentRateType === 'daily') {
        unit = 'day';
    } else if (currentRateType === 'job') {
        unit = 'job';
    } else {
        unit = customUnit || 'item';
    }

    var lineTotal = unitPrice * quantity;

    items.push({
        category: category,
        description: description,
        quantity: quantity,
        unit: unit,
        unitPrice: unitPrice,
        lineTotal: lineTotal
    });

    updateQuoteTable();
    
    document.getElementById('description').value = '';
    document.getElementById('quantity').value = '1';
    document.getElementById('unitPrice').value = '';
    document.getElementById('customUnit').value = '';
    document.getElementById('tradeCategory').selectedIndex = 0;
    document.getElementById('tradeRateInfo').textContent = '';
    
    alert('Item added successfully!');
}

function removeItem(index) {
    if (confirm('Remove this item?')) {
        items.splice(index, 1);
        updateQuoteTable();
    }
}

function updateQuoteTable() {
    var tbody = document.getElementById('quoteItems');
    var quoteSection = document.getElementById('quoteSection');
    var generateSection = document.getElementById('generateSection');

    if (items.length === 0) {
        quoteSection.style.display = 'none';
        generateSection.style.display = 'none';
        return;
    }

    quoteSection.style.display = 'block';
    generateSection.style.display = 'block';

    var html = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        html += '<tr>';
        html += '<td>' + item.category + '</td>';
        html += '<td>' + item.description + '</td>';
        html += '<td class="text-center">' + item.quantity + '</td>';
        html += '<td class="text-right">£' + item.unitPrice.toFixed(2) + '</td>';
        html += '<td class="text-right" style="font-weight: 600;">£' + item.lineTotal.toFixed(2) + '</td>';
        html += '<td class="text-center"><button class="btn-delete" onclick="removeItem(' + i + ')">Delete</button></td>';
        html += '</tr>';
    }

    var subtotal = 0;
    for (var j = 0; j < items.length; j++) {
        subtotal += items[j].lineTotal;
    }

    var vat = subtotal * 0.20;
    var total = subtotal + vat;
    
    html += '<tr class="total-row">';
    html += '<td colspan="4" class="text-right">Subtotal:</td>';
    html += '<td class="text-right">£' + subtotal.toFixed(2) + '</td>';
    html += '<td></td>';
    html += '</tr>';
    html += '<tr class="total-row">';
    html += '<td colspan="4" class="text-right">VAT (20%):</td>';
    html += '<td class="text-right">£' + vat.toFixed(2) + '</td>';
    html += '<td></td>';
    html += '</tr>';
    html += '<tr class="total-row">';
    html += '<td colspan="4" class="text-right" style="font-size: 16px;"><strong>TOTAL:</strong></td>';
    html += '<td class="text-right" style="font-size: 16px;"><strong>£' + total.toFixed(2) + '</strong></td>';
    html += '<td></td>';
    html += '</tr>';

    tbody.innerHTML = html;
}

function previewQuote() {
    if (items.length === 0) {
        alert('Please add items before previewing');
        return;
    }
    
    var clientName = document.getElementById('clientName').value || '[Client Name]';
    var clientPhone = document.getElementById('clientPhone').value;
    var projectName = document.getElementById('projectName').value || '[Project Name]';
    var projectAddress = document.getElementById('projectAddress').value || '[Project Address]';
    var customerId = document.getElementById('customerId').value || 'N/A';
    var depositPercent = document.getElementById('depositPercent').value || '30';
    
    var today = new Date();
    var quoteDate = today.toLocaleDateString('en-GB');
    var expiryDate = new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');
    var estNumber = String(estimateNumber).padStart(4, '0');
    
    var subtotal = 0;
    for (var j = 0; j < items.length; j++) {
        subtotal += items[j].lineTotal;
    }
    var vat = subtotal * 0.20;
    var total = subtotal + vat;

    var categories = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    }

    var previewHtml = '<div class="preview-content">';
    previewHtml += '<div class="preview-header">';
    previewHtml += '<div class="preview-logo"><img src="https://github.com/infotraderbrothers-lgtm/traderbrothers-assets-logo/blob/main/Trader%20Brothers.png?raw=true" alt="TB"></div>';
    previewHtml += '<div class="preview-company-info">';
    previewHtml += '<div class="preview-company">TRADER BROTHERS LTD</div>';
    previewHtml += '<div>8 Craigour Terrace</div>';
    previewHtml += '<div>Edinburgh, EH17 7PB</div>';
    previewHtml += '<div>📞: 07979309957</div>';
    previewHtml += '<div>✉: traderbrotherslimited@gmail.com</div>';
    previewHtml += '</div></div>';

    previewHtml += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; padding-top: 10px; border-top: 1px solid #ddd;">';
    previewHtml += '<div>';
    previewHtml += '<div style="font-weight: bold; margin-bottom: 8px;">Estimate for</div>';
    previewHtml += '<div>' + clientName + '</div>';
    previewHtml += '<div>' + projectName + '</div>';
    previewHtml += '<div>' + projectAddress + '</div>';
    if (clientPhone) previewHtml += '<div>' + clientPhone + '</div>';
    previewHtml += '</div>';
    previewHtml += '<div style="text-align: right;">';
    previewHtml += '<div><strong>Date</strong> ' + quoteDate + '</div>';
    previewHtml += '<div><strong>Estimate #</strong> ' + estNumber + '</div>';
    previewHtml += '<div><strong>Customer ID</strong> ' + customerId + '</div>';
    previewHtml += '<div><strong>Expiry date</strong> ' + expiryDate + '</div>';
    previewHtml += '</div>';
    previewHtml += '</div>';

    previewHtml += '<table class="preview-table">';
    previewHtml += '<thead><tr>';
    previewHtml += '<th style="width: 55%;">Description</th>';
    previewHtml += '<th style="text-align: center; width: 10%;">Qty</th>';
    previewHtml += '<th style="text-align: right; width: 17%;">Unit price</th>';
    previewHtml += '<th style="text-align: right; width: 18%;">Total price</th>';
    previewHtml += '</tr></thead>';
    previewHtml += '<tbody>';

    for (var category in categories) {
        previewHtml += '<tr class="preview-category">';
        previewHtml += '<td colspan="4"><strong>' + category + '</strong></td>';
        previewHtml += '</tr>';

        var categoryItems = categories[category];
        for (var k = 0; k < categoryItems.length; k++) {
            var item = categoryItems[k];
            previewHtml += '<tr>';
            previewHtml += '<td>' + item.description + '</td>';
            previewHtml += '<td style="text-align: center;">' + item.quantity + '</td>';
            previewHtml += '<td style="text-align: right;">£' + item.unitPrice.toFixed(2) + '</td>';
            previewHtml += '<td style="text-align: right;">£' + item.lineTotal.toFixed(2) + '</td>';
            previewHtml += '</tr>';
        }
    }

    previewHtml += '</tbody></table>';

    previewHtml += '<div style="margin-top: 15px; font-size: 10px;">';
    previewHtml += '<div style="margin-bottom: 10px;"><strong>Notes:</strong></div>';
    previewHtml += '<div>1. Estimate valid for 31 days</div>';
    previewHtml += '<div>2. Deposit of ' + depositPercent + '% is required to secure start date</div>';
    previewHtml += '<div>3. Extra works to be charged accordingly</div>';
    var customNotes = document.getElementById('customNotes').value;
    if (customNotes) {
        previewHtml += '<div style="margin-top: 8px;">4. ' + customNotes + '</div>';
    }
    previewHtml += '</div>';

    previewHtml += '<div style="text-align: right; margin-top: 15px; font-size: 10px;">';
    previewHtml += '<div style="margin-bottom: 3px;"><strong>Subtotal</strong> £' + subtotal.toFixed(2) + '</div>';
    previewHtml += '<div style="margin-bottom: 3px;"><strong>VAT</strong> £' + vat.toFixed(2) + '</div>';
    previewHtml += '<div style="font-size: 12px; font-weight: bold; padding-top: 5px; border-top: 1px solid #ddd;">£' + total.toFixed(2) + '</div>';
    previewHtml += '</div>';

    previewHtml += '<div style="margin-top: 15px; font-size: 8px; border-top: 1px solid #ddd; padding-top: 8px;">';
    previewHtml += 'If you have any questions about this estimate, please contact traderbrotherslimited@gmail.com, or 07979309957.<br>';
    previewHtml += '<strong>Thank you for your business</strong>';
    previewHtml += '</div>';

    previewHtml += '</div>';

    document.getElementById('previewBody').innerHTML = previewHtml;
    document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

function generateCompleteHTML() {
    var clientName = document.getElementById('clientName').value || '[Client Name]';
    var clientPhone = document.getElementById('clientPhone').value;
    var projectName = document.getElementById('projectName').value || '[Project Name]';
    var projectAddress = document.getElementById('projectAddress').value || '[Project Address]';
    var customerId = document.getElementById('customerId').value || 'N/A';
    var depositPercent = document.getElementById('depositPercent').value || '30';
    
    var today = new Date();
    var quoteDate = today.toLocaleDateString('en-GB');
    var expiryDate = new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');
    var estNumber = String(estimateNumber).padStart(4, '0');
    
    var subtotal = 0;
    for (var j = 0; j < items.length; j++) {
        subtotal += items[j].lineTotal;
    }
    var vat = subtotal * 0.20;
    var total = subtotal + vat;

    var itemsRows = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        itemsRows += '<tr>';
        itemsRows += '<td>' + item.description + '</td>';
        itemsRows += '<td>' + item.quantity + '</td>';
        itemsRows += '<td>£' + item.unitPrice.toFixed(2) + '</td>';
        itemsRows += '<td>£' + item.lineTotal.toFixed(2) + '</td>';
        itemsRows += '</tr>';
    }

    var customNotes = document.getElementById('customNotes').value;
    var notesHtml = '';
    if (customNotes) {
        notesHtml = '<li>' + customNotes + '</li>';
    }

    var styles = '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:white;padding:20px;color:#333}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #333}.company-info{flex:1}.company-name{font-size:24px;font-weight:bold;margin-bottom:10px;color:#333}.company-name .highlight{color:#d4af37}.company-details{font-size:11px;line-height:1.6;color:#666}.logo-container{flex-shrink:0}.logo{width:120px;height:auto;display:block}.estimate-banner{background:linear-gradient(135deg,#bc9c22,#d4af37);padding:15px 20px;margin-bottom:25px;display:inline-block;font-weight:bold;font-size:16px;color:white}.info-section{display:flex;justify-content:space-between;margin-bottom:30px}.client-info{flex:1}.client-info h3{font-size:16px;color:#666;margin-bottom:10px;font-weight:bold}.client-info p{font-size:15px;line-height:1.6;color:#333;font-weight:500}.estimate-details{flex:0 0 250px}.details-table{width:100%;border-collapse:collapse}.details-table td{padding:8px 10px;font-size:13px}.detail-label{color:#666;text-align:left;width:120px}.detail-value{font-weight:bold;color:#333;text-align:left}.expiry-date{background:linear-gradient(135deg,#bc9c22,#d4af37);padding:5px 10px;display:inline-block;color:white;font-weight:bold}.items-table{width:100%;border-collapse:collapse;margin:30px 0}.items-table thead{background:#f5f5f5}.items-table th{padding:14px 12px;text-align:left;font-size:14px;font-weight:bold;color:#333;border-bottom:2px solid #ddd}.items-table th:nth-child(2),.items-table th:nth-child(3),.items-table th:nth-child(4){text-align:right;width:100px}.items-table td{padding:8px 12px;font-size:12px;font-weight:normal;border-bottom:1px solid #f0f0f0;color:#555}.items-table td:nth-child(2),.items-table td:nth-child(3),.items-table td:nth-child(4){text-align:right}.notes-section{margin:30px 0;padding:20px;background:#f9f9f9;border-left:3px solid #bc9c22}.notes-section h3{font-size:13px;margin-bottom:10px;color:#333}.notes-section ol{margin-left:20px;font-size:12px;line-height:1.8;color:#666}.totals-section-preview{margin-top:30px;display:flex;justify-content:flex-end}.totals-box{width:300px}.total-row-preview{display:flex;justify-content:space-between;padding:10px 15px;font-size:13px}.total-row-preview.subtotal{border-top:1px solid #ddd}.total-row-preview.vat{color:#666}.total-row-preview.final{background:linear-gradient(135deg,#bc9c22,#d4af37);color:white;font-weight:bold;font-size:16px;border-top:2px solid #333;margin-top:5px}.footer-note{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:11px;color:#666;font-style:italic}.thank-you{margin-top:15px;font-weight:bold;color:#333;font-size:12px}@media print{body{padding:0}}</style>';

    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Estimate - ' + clientName + '</title>' + styles + '</head><body><div class="estimate-container"><div class="header"><div class="company-info"><div class="company-name">TR<span class="highlight">A</span>DER BROTHERS LTD</div><div class="company-details">8 Craigour Terrace<br>Edinburgh, EH17 7PB<br>07979309957<br>traderbrotherslimited@gmail.com</div></div><div class="logo-container"><img src="https://github.com/infotraderbrothers-lgtm/traderbrothers-assets-logo/blob/main/Trader%20Brothers.png?raw=true" alt="Trader Brothers Logo" class="logo"></div></div><div class="estimate-banner">Estimate for</div><div class="info-section"><div class="client-info"><h3>' + clientName + '</h3><p>' + projectName + '<br>' + projectAddress + (clientPhone ? '<br>' + clientPhone : '') + '</p></div><div class="estimate-details"><table class="details-table"><tr><td class="detail-label">Date:</td><td class="detail-value">' + quoteDate + '</td></tr><tr><td class="detail-label">Estimate #:</td><td class="detail-value">' + estNumber + '</td></tr><tr><td class="detail-label">Customer Ref:</td><td class="detail-value">' + customerId + '</td></tr><tr><td class="detail-label">Expiry Date:</td><td class="expiry-date">' + expiryDate + '</td></tr></table></div></div><table class="items-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Total price</th></tr></thead><tbody>' + itemsRows + '</tbody></table><div class="notes-section"><h3>Notes:</h3><ol><li>Estimate valid for 31 days</li><li>Payment of ' + depositPercent + '% is required to secure start date</li><li>Pending to be supplied by customer</li><li>Any extras to be charged accordingly</li>' + notesHtml + '</ol></div><div class="totals-section-preview"><div class="totals-box"><div class="total-row-preview subtotal"><span>Subtotal</span><span>£' + subtotal.toFixed(2) + '</span></div><div class="total-row-preview vat"><span>VAT</span><span>£' + vat.toFixed(2) + '</span></div><div class="total-row-preview final"><span>Total</span><span>£' + total.toFixed(2) + '</span></div></div></div><div class="footer-note">If you have any questions about this estimate, please contact Trader Brothers on 07448835577<div class="thank-you">Thank you for your business</div></div></div></body></html>';
}

async function downloadQuote() {
    if (items.length === 0) {
        alert('Please add items to the quote before generating PDF');
        return;
    }

    var clientName = document.getElementById('clientName').value || 'Client';
    var estNumber = String(estimateNumber).padStart(4, '0');
    
    var downloadBtns = document.querySelectorAll('button');
    var downloadBtn = null;
    for (var i = 0; i < downloadBtns.length; i++) {
        if (downloadBtns[i].textContent.includes('Download PDF') || downloadBtns[i].textContent.includes('Generating PDF')) {
            downloadBtn = downloadBtns[i];
            break;
        }
    }
    
    var originalText = downloadBtn ? downloadBtn.textContent : '';
    if (downloadBtn) {
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;
    }

    try {
        var htmlContent = generateCompleteHTML();
        
        var sanitizedClientName = clientName.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
        var filename = 'Estimate_' + estNumber + '_' + sanitizedClientName + '.pdf';

        console.log('Sending request to PDFShift...');

        var response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('api:' + PDFSHIFT_API_KEY),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: htmlContent,
                landscape: false,
                use_print: true,
                margin: {
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px'
                }
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            var errorData;
            try {
                errorData = await response.json();
                console.error('PDFShift error response:', errorData);
            } catch (e) {
                errorData = { error: await response.text() || 'Unknown error' };
            }
            if (response.status === 401) {
                throw new Error('Authentication failed. Please check your PDFShift API key.');
            } else if (response.status === 403) {
                throw new Error('Access forbidden. Your API key may not have permission.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. You may have used your free tier quota (250 PDFs/month).');
            } else if (response.status === 400) {
                throw new Error('Bad Request: ' + (errorData.error || errorData.message || 'Invalid request'));
             } else {
                throw new Error((errorData.error || errorData.message) || 'API Error (' + response.status + '): ' + response.statusText);
            }
        }

        console.log('Receiving PDF from PDFShift...');

        var blob = await response.blob();
        if (blob.size === 0) {
            throw new Error('Received empty PDF from server');
        }

        console.log('PDF blob size:', blob.size, 'bytes');

        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);

        console.log('PDF downloaded successfully!');
        
        localStorage.setItem('traderBrosEstimateCount', estimateNumber);
        estimateNumber++;
        updateEstimateCounter();
        
        setTimeout(function() {
            alert('✓ PDF downloaded successfully!\n\nFile: ' + filename);
        }, 200);
        
        closePreview();

    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error.stack);
        var errorMessage = 'Error generating PDF\n\n';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'Network Error - Cannot connect to PDFShift API.\n\n';
            errorMessage += 'Please check:\n';
            errorMessage += '• Your internet connection\n';
            errorMessage += '• Firewall or browser extensions blocking the request\n';
            errorMessage += '• Try using a different browser\n\n';
            errorMessage += 'Technical details are in the console (press F12)';
        } else {
            errorMessage += error.message;
            errorMessage += '\n\nCheck console for more details (press F12)';
        }
        alert(errorMessage);
    } finally {
        if (downloadBtn) {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }
}
