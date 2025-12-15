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
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    var savedCount = localStorage.getItem('traderBrosEstimateCount');
    if (savedCount) estimateNumber = parseInt(savedCount) + 1;
    updateEstimateCounter();
    setupEventListeners();
}

function setupEventListeners() {
    // Client name
    var clientNameInput = document.getElementById('clientName');
    if (clientNameInput) {
        clientNameInput.addEventListener('input', handleClientNameInput);
    }
    
    // Trade category
    var tradeCategorySelect = document.getElementById('tradeCategory');
    if (tradeCategorySelect) {
        tradeCategorySelect.addEventListener('change', handleTradeCategoryChange);
    }
    
    // Rate type buttons - Fixed with proper event delegation
    var rateTypeBtns = document.querySelectorAll('.rate-type-btn');
    rateTypeBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleRateTypeClick(btn);
        });
    });
    
    // Add item button
    var addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addItem();
        });
    }
    
    // Preview button
    var previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            previewQuote();
        });
    }
    
    // Download buttons
    var downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadQuote();
        });
    }
    
    var downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadQuote();
        });
    }
    
    // Close modal buttons
    var closePreviewBtn = document.getElementById('closePreviewBtn');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closePreview();
        });
    }
    
    var closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closePreview();
        });
    }
    
    // Modal close on outside click
    window.onclick = function(e) {
        var modal = document.getElementById('previewModal');
        if (e.target == modal) {
            closePreview();
        }
    };
}

function updateEstimateCounter() {
    var elem = document.getElementById('estimateCounter');
    if (elem) elem.textContent = '#' + String(estimateNumber).padStart(4, '0');
}

function handleClientNameInput() {
    var name = this.value.trim();
    var customerIdInput = document.getElementById('customerId');
    
    if (!name) {
        customerIdInput.value = '';
        return;
    }
    
    var parts = name.split(' ');
    var customerId;
    
    if (parts.length >= 2) {
        customerId = parts[0].substring(0, 3).toUpperCase() + 
                     parts[parts.length - 1].substring(0, 3).toUpperCase() + 
                     Math.floor(1000 + Math.random() * 9000);
    } else {
        customerId = parts[0].substring(0, 6).toUpperCase() + 
                     Math.floor(1000 + Math.random() * 9000);
    }
    
    customerIdInput.value = customerId;
}

function handleTradeCategoryChange() {
    var selectedTrade = this.value;
    var rateInfo = document.getElementById('tradeRateInfo');
    
    if (selectedTrade && tradeRates[selectedTrade]) {
        var rates = tradeRates[selectedTrade];
        var rateParts = [];
        
        if (rates.hourly > 0) rateParts.push('£' + rates.hourly + '/hr');
        if (rates.daily > 0) rateParts.push('£' + rates.daily + '/day');
        if (rates.job > 0) rateParts.push('£' + rates.job + '/job');
        
        rateInfo.textContent = rateParts.length > 0 ? 'Standard rates: ' + rateParts.join(' | ') : '';
        updatePriceFromTrade();
    } else {
        rateInfo.textContent = '';
        document.getElementById('unitPrice').value = '';
    }
}

function handleRateTypeClick(btn) {
    // Remove active from all buttons
    var allBtns = document.querySelectorAll('.rate-type-btn');
    allBtns.forEach(function(b) {
        b.classList.remove('active');
    });
    
    // Add active to clicked button
    btn.classList.add('active');
    
    currentRateType = btn.getAttribute('data-type');
    
    var customUnitGroup = document.getElementById('customUnitGroup');
    var rateLabel = document.getElementById('rateLabel');
    
    if (currentRateType === 'custom') {
        customUnitGroup.classList.remove('hidden');
        rateLabel.textContent = 'Unit Price (£) *';
    } else {
        customUnitGroup.classList.add('hidden');
        if (currentRateType === 'daily') {
            rateLabel.textContent = 'Day Rate (£) *';
        } else if (currentRateType === 'job') {
            rateLabel.textContent = 'Per Job Rate (£) *';
        } else {
            rateLabel.textContent = 'Hourly Rate (£) *';
        }
    }
    
    updatePriceFromTrade();
}

function updatePriceFromTrade() {
    var selectedTrade = document.getElementById('tradeCategory').value;
    if (!selectedTrade || !tradeRates[selectedTrade]) return;
    
    var rates = tradeRates[selectedTrade];
    var price = rates[currentRateType] || 0;
    
    if (price > 0) {
        document.getElementById('unitPrice').value = price;
    }
}

function addItem() {
    var category = document.getElementById('tradeCategory').value || 'General';
    var description = document.getElementById('description').value.trim();
    var quantity = parseFloat(document.getElementById('quantity').value);
    var unitPrice = parseFloat(document.getElementById('unitPrice').value);
    var customUnit = document.getElementById('customUnit').value;

    // Validation
    if (!description) {
        alert('Please enter a description');
        return;
    }
    if (!unitPrice || unitPrice <= 0) {
        alert('Please enter a valid unit price');
        return;
    }
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }

    var unit = currentRateType === 'hourly' ? 'hour' : 
               currentRateType === 'daily' ? 'day' : 
               currentRateType === 'job' ? 'job' : 
               customUnit || 'item';

    items.push({
        category: category,
        description: description,
        quantity: quantity,
        unit: unit,
        unitPrice: unitPrice,
        lineTotal: unitPrice * quantity
    });

    updateQuoteTable();
    
    // Clear form
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

    var subtotal = items.reduce(function(sum, item) {
        return sum + item.lineTotal;
    }, 0);
    var vat = subtotal * 0.20;
    var total = subtotal + vat;
    
    var html = items.map(function(item, i) {
        return '<tr>' +
            '<td>' + item.category + '</td>' +
            '<td>' + item.description + '</td>' +
            '<td class="text-center">' + item.quantity + '</td>' +
            '<td class="text-right">£' + item.unitPrice.toFixed(2) + '</td>' +
            '<td class="text-right" style="font-weight: 600;">£' + item.lineTotal.toFixed(2) + '</td>' +
            '<td class="text-center"><button class="btn-delete" onclick="removeItem(' + i + '); return false;">Delete</button></td>' +
        '</tr>';
    }).join('') + 
        '<tr class="total-row">' +
            '<td colspan="4" class="text-right">Subtotal:</td>' +
            '<td class="text-right">£' + subtotal.toFixed(2) + '</td>' +
            '<td></td>' +
        '</tr>' +
        '<tr class="total-row">' +
            '<td colspan="4" class="text-right">VAT (20%):</td>' +
            '<td class="text-right">£' + vat.toFixed(2) + '</td>' +
            '<td></td>' +
        '</tr>' +
        '<tr class="total-row">' +
            '<td colspan="4" class="text-right" style="font-size: 16px;"><strong>TOTAL:</strong></td>' +
            '<td class="text-right" style="font-size: 16px;"><strong>£' + total.toFixed(2) + '</strong></td>' +
            '<td></td>' +
        '</tr>';

    tbody.innerHTML = html;
}

function previewQuote() {
    if (items.length === 0) {
        alert('Please add items before previewing');
        return;
    }
    
    var data = getQuoteData();
    document.getElementById('previewBody').innerHTML = generatePreviewHTML(data);
    document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

function getQuoteData() {
    var subtotal = items.reduce(function(sum, item) {
        return sum + item.lineTotal;
    }, 0);
    
    return {
        clientName: document.getElementById('clientName').value || '[Client Name]',
        clientPhone: document.getElementById('clientPhone').value,
        projectName: document.getElementById('projectName').value || '[Project Name]',
        projectAddress: document.getElementById('projectAddress').value || '[Project Address]',
        customerId: document.getElementById('customerId').value || 'N/A',
        depositPercent: document.getElementById('depositPercent').value || '30',
        quoteDate: new Date().toLocaleDateString('en-GB'),
        expiryDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        estNumber: String(estimateNumber).padStart(4, '0'),
        subtotal: subtotal,
        vat: subtotal * 0.20,
        total: subtotal * 1.20,
        customNotes: document.getElementById('customNotes').value
    };
}

function generatePreviewHTML(data) {
    var itemsHTML = items.map(function(item) {
        return '<tr>' +
            '<td>' + item.description + '</td>' +
            '<td>' + item.quantity + '</td>' +
            '<td>£' + item.unitPrice.toFixed(2) + '</td>' +
            '<td>£' + item.lineTotal.toFixed(2) + '</td>' +
        '</tr>';
    }).join('');

    return '<div class="estimate-container">' +
        '<div class="preview-header">' +
            '<div class="company-info">' +
                '<div class="company-name">TR<span class="highlight">A</span>DER BROTHERS LTD</div>' +
                '<div class="company-details">' +
                    '8 Craigour Terrace<br>Edinburgh, EH17 7PB<br>' +
                    '07979309957<br>traderbrotherslimited@gmail.com' +
                '</div>' +
            '</div>' +
            '<div class="logo-container">' +
                '<img src="https://github.com/infotraderbrothers-lgtm/traderbrothers-assets-logo/blob/main/Trader%20Brothers.png?raw=true" alt="Logo">' +
            '</div>' +
        '</div>' +
        '<div class="estimate-banner">Estimate for</div>' +
        '<div class="info-section">' +
            '<div class="client-info">' +
                '<h3>' + data.clientName + '</h3>' +
                '<p>' + data.projectName + '<br>' + data.projectAddress + (data.clientPhone ? '<br>' + data.clientPhone : '') + '</p>' +
            '</div>' +
            '<div class="estimate-details">' +
                '<table class="details-table">' +
                    '<tr><td class="detail-label">Date:</td><td class="detail-value">' + data.quoteDate + '</td></tr>' +
                    '<tr><td class="detail-label">Estimate #:</td><td class="detail-value">' + data.estNumber + '</td></tr>' +
                    '<tr><td class="detail-label">Customer Ref:</td><td class="detail-value">' + data.customerId + '</td></tr>' +
                    '<tr><td class="detail-label">Expiry Date:</td><td class="expiry-date">' + data.expiryDate + '</td></tr>' +
                '</table>' +
            '</div>' +
        '</div>' +
        '<table class="items-table">' +
            '<thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Total price</th></tr></thead>' +
            '<tbody>' + itemsHTML + '</tbody>' +
        '</table>' +
        '<div class="notes-section">' +
            '<h3>Notes:</h3>' +
            '<ol>' +
                '<li>Estimate valid for 31 days</li>' +
                '<li>Payment of ' + data.depositPercent + '% required to secure start date</li>' +
                '<li>Pending to be supplied by customer</li>' +
                '<li>Any extras charged accordingly</li>' +
                (data.customNotes ? '<li>' + data.customNotes + '</li>' : '') +
            '</ol>' +
        '</div>' +
        '<div class="totals-section-preview">' +
            '<div class="totals-box">' +
                '<div class="total-row-preview subtotal"><span>Subtotal</span><span>£' + data.subtotal.toFixed(2) + '</span></div>' +
                '<div class="total-row-preview vat"><span>VAT</span><span>£' + data.vat.toFixed(2) + '</span></div>' +
                '<div class="total-row-preview final"><span>Total</span><span>£' + data.total.toFixed(2) + '</span></div>' +
            '</div>' +
        '</div>' +
        '<div class="footer-note">' +
            'If you have any questions about this estimate, please contact<br>' +
            'Trader Brothers on 07448835577' +
            '<div class="thank-you">Thank you for your business</div>' +
        '</div>' +
    '</div>';
}

function generateCompleteHTML() {
    var data = getQuoteData();
    var itemsRows = items.map(function(item) {
        return '<tr>' +
            '<td>' + item.description + '</td>' +
            '<td>' + item.quantity + '</td>' +
            '<td>£' + item.unitPrice.toFixed(2) + '</td>' +
            '<td>£' + item.lineTotal.toFixed(2) + '</td>' +
        '</tr>';
    }).join('');

    return '<!DOCTYPE html>' +
'<html><head><meta charset="UTF-8"><title>Estimate - ' + data.clientName + '</title>' +
'<style>' +
'*{margin:0;padding:0;box-sizing:border-box}' +
'body{font-family:Arial,sans-serif;padding:20px;color:#333}' +
'.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #333}' +
'.company-name{font-size:24px;font-weight:bold;margin-bottom:10px}' +
'.company-name .highlight{color:#d4af37}' +
'.company-details{font-size:11px;line-height:1.6;color:#666}' +
'.logo{width:120px;height:auto}' +
'.estimate-banner{background:linear-gradient(135deg,#bc9c22,#d4af37);padding:15px 20px;margin-bottom:25px;display:inline-block;font-weight:bold;color:white}' +
'.info-section{display:flex;justify-content:space-between;margin-bottom:30px}' +
'.client-info h3{font-size:16px;color:#666;margin-bottom:10px;font-weight:bold}' +
'.client-info p{font-size:15px;line-height:1.6;font-weight:500}' +
'.details-table{width:100%;border-collapse:collapse}' +
'.details-table td{padding:8px 10px;font-size:13px}' +
'.detail-label{color:#666;width:120px}' +
'.detail-value{font-weight:bold}' +
'.expiry-date{background:linear-gradient(135deg,#bc9c22,#d4af37);padding:5px 10px;color:white;font-weight:bold}' +
'.items-table{width:100%;border-collapse:collapse;margin:30px 0}' +
'.items-table thead{background:#f5f5f5}' +
'.items-table th{padding:14px 12px;text-align:left;font-weight:bold;border-bottom:2px solid #ddd}' +
'.items-table th:nth-child(2),.items-table th:nth-child(3),.items-table th:nth-child(4){text-align:right}' +
'.items-table td{padding:8px 12px;font-size:12px;border-bottom:1px solid #f0f0f0}' +
'.items-table td:nth-child(2),.items-table td:nth-child(3),.items-table td:nth-child(4){text-align:right}' +
'.notes-section{margin:30px 0;padding:20px;background:#f9f9f9;border-left:3px solid #bc9c22}' +
'.notes-section h3{font-size:13px;margin-bottom:10px}' +
'.notes-section ol{margin-left:20px;font-size:12px;line-height:1.8;color:#666}' +
'.totals-section-preview{margin-top:30px;display:flex;justify-content:flex-end}' +
'.totals-box{width:300px}' +
'.total-row-preview{display:flex;justify-content:space-between;padding:10px 15px;font-size:13px}' +
'.total-row-preview.subtotal{border-top:1px solid #ddd}' +
'.total-row-preview.vat{color:#666}' +
'.total-row-preview.final{background:linear-gradient(135deg,#bc9c22,#d4af37);color:white;font-weight:bold;font-size:16px;margin-top:5px}' +
'.footer-note{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:11px;color:#666;font-style:italic}' +
'.thank-you{margin-top:15px;font-weight:bold;color:#333}' +
'</style></head><body>' +
'<div class="header">' +
    '<div class="company-info">' +
        '<div class="company-name">TR<span class="highlight">A</span>DER BROTHERS LTD</div>' +
        '<div class="company-details">8 Craigour Terrace<br>Edinburgh, EH17 7PB<br>07979309957<br>traderbrotherslimited@gmail.com</div>' +
    '</div>' +
    '<div class="logo-container">' +
        '<img src="https://github.com/infotraderbrothers-lgtm/traderbrothers-assets-logo/blob/main/Trader%20Brothers.png?raw=true" alt="Logo" class="logo">' +
    '</div>' +
'</div>' +
'<div class="estimate-banner">Estimate for</div>' +
'<div class="info-section">' +
    '<div class="client-info">' +
        '<h3>' + data.clientName + '</h3>' +
        '<p>' + data.projectName + '<br>' + data.projectAddress + (data.clientPhone ? '<br>' + data.clientPhone : '') + '</p>' +
    '</div>' +
    '<div class="estimate-details">' +
        '<table class="details-table">' +
            '<tr><td class="detail-label">Date:</td><td class="detail-value">' + data.quoteDate + '</td></tr>' +
            '<tr><td class="detail-label">Estimate #:</td><td class="detail-value">' + data.estNumber + '</td></tr>' +
            '<tr><td class="detail-label">Customer Ref:</td><td class="detail-value">' + data.customerId + '</td></tr>' +
            '<tr><td class="detail-label">Expiry Date:</td><td class="expiry-date">' + data.expiryDate + '</td></tr>' +
        '</table>' +
    '</div>' +
'</div>' +
'<table class="items-table">' +
    '<thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Total price</th></tr></thead>' +
    '<tbody>' + itemsRows + '</tbody>' +
'</table>' +
'<div class="notes-section">' +
    '<h3>Notes:</h3>' +
    '<ol>' +
        '<li>Estimate valid for 31 days</li>' +
        '<li>Payment of ' + data.depositPercent + '% required to secure start date</li>' +
        '<li>Pending to be supplied by customer</li>' +
        '<li>Any extras charged accordingly</li>' +
        (data.customNotes ? '<li>' + data.customNotes + '</li>' : '') +
    '</ol>' +
'</div>' +
'<div class="totals-section-preview">' +
    '<div class="totals-box">' +
        '<div class="total-row-preview subtotal"><span>Subtotal</span><span>£' + data.subtotal.toFixed(2) + '</span></div>' +
        '<div class="total-row-preview vat"><span>VAT</span><span>£' + data.vat.toFixed(2) + '</span></div>' +
        '<div class="total-row-preview final"><span>Total</span><span>£' + data.total.toFixed(2) + '</span></div>' +
    '</div>' +
'</div>' +
'<div class="footer-note">' +
    'If you have any questions, please contact Trader Brothers on 07448835577' +
    '<div class="thank-you">Thank you for your business</div>' +
'</div>' +
'</body></html>';
}

async function downloadQuote() {
    if (items.length === 0) {
        alert('Please add items before generating PDF');
        return;
    }

    var data = getQuoteData();
    var filename = 'Estimate_' + data.estNumber + '_' + data.clientName.substring(0,20).replace(/[^a-zA-Z0-9]/g,'_') + '.pdf';
    
    var downloadBtn = document.querySelector('button:focus') || document.getElementById('downloadBtn');
    var originalText = downloadBtn ? downloadBtn.textContent : '';
    if (downloadBtn) {
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;
    }

    try {
        var response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa('api:' + PDFSHIFT_API_KEY),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: generateCompleteHTML(),
                landscape: false,
                use_print: true,
                margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
            })
        });

        if (!response.ok) {
            var errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: 'Unknown error' };
            }
            throw new Error(errorData.error || errorData.message || 'Error ' + response.status);
        }

        var blob = await response.blob();
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        localStorage.setItem('traderBrosEstimateCount', estimateNumber);
        estimateNumber++;
        updateEstimateCounter();
        
        alert('✓ PDF downloaded successfully!\n\nFile: ' + filename);
        closePreview();

    } catch (error) {
        console.error('PDF Error:', error);
        alert('Error generating PDF:\n\n' + error.message);
    } finally {
        if (downloadBtn) {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }
}
