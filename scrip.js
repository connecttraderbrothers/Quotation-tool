var items = [];
var currentRateType = 'job';
var estimateNumber = 1;

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

if (localStorage.getItem('traderBrosEstimateCount')) {
    estimateNumber = parseInt(localStorage.getItem('traderBrosEstimateCount')) + 1;
}
updateEstimateCounter();

function updateEstimateCounter() {
    document.getElementById('estimateCounter').textContent = '#' + String(estimateNumber).padStart(4, '0');
}

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

function addItem() {
    var category = document.getElementById('tradeCategory').value || 'General';
    var description = document.getElementById('description').value;
    var quantity = parseFloat(document.getElementById('quantity').value);
    var unitPrice = parseFloat(document.getElementById('unitPrice').value);
    var customUnit = document.getElementById('customUnit').value;

    if (!description || !unitPrice) {
        alert('Please enter description and unit price');
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
}

function removeItem(index) {
    items.splice(index, 1);
    updateQuoteTable();
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

function downloadQuote() {
    var clientName = document.getElementById('clientName').value || '[Client Name]';
    var clientPhone = document.getElementById('clientPhone').value;
    var projectAddress = document.getElementById('projectAddress').value || '[Project Address]';
    var projectName = document.getElementById('projectName').value || '[Project Name]';
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
    
    var { jsPDF } = window.jspdf;
    var doc = new jsPDF();
    
    doc.setFillColor(251, 191, 36);
    doc.rect(15, 10, 15, 15, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('TB', 22.5, 21, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('TRADER BROTHERS LTD', 32, 15);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('8 Craigour Terrace', 32, 20);
    doc.text('Edinburgh, EH17 7PB', 32, 24);
    doc.text('07979309957', 32, 28);
    doc.text('traderbrotherslimited@gmail.com', 32, 32);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Estimate for', 15, 42);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    var leftY = 47;
    doc.text(clientName, 15, leftY);
    leftY += 4;
    doc.text(projectName, 15, leftY);
    leftY += 4;
    
    var addressLines = doc.splitTextToSize(projectAddress, 70);
    doc.text(addressLines, 15, leftY);
    leftY += (addressLines.length * 4);
    
    if (clientPhone) {
        doc.text(clientPhone, 15, leftY);
    }
    
    var rightX = 130;
    var rightY = 42;
    doc.setFont(undefined, 'bold');
    doc.text('Date', rightX, rightY);
    doc.setFont(undefined, 'normal');
    doc.text(quoteDate, 180, rightY, { align: 'right' });
    
    rightY += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Estimate #', rightX, rightY);
    doc.setFont(undefined, 'normal');
    doc.text(estNumber, 180, rightY, { align: 'right' });
    
    rightY += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Customer ID', rightX, rightY);
    doc.setFont(undefined, 'normal');
    doc.text(customerId, 180, rightY, { align: 'right' });
    
    rightY += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Expiry date', rightX, rightY);
    doc.setFont(undefined, 'normal');
    doc.text(expiryDate, 180, rightY, { align: 'right' });
    
    var yPos = Math.max(leftY, rightY) + 10;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPos - 4, 180, 6, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Description', 17, yPos);
    doc.text('Qty', 133, yPos, { align: 'center' });
    doc.text('Unit price', 165, yPos, { align: 'right' });
    doc.text('Total price', 193, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFont(undefined, 'normal');
    
    var categories = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    }
    
    for (var category in categories) {
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text(category, 17, yPos);
        yPos += 5;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        
        var categoryItems = categories[category];
        for (var k = 0; k < categoryItems.length; k++) {
            var item = categoryItems[k];
            
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            
            var descLines = doc.splitTextToSize(item.description, 110);
            doc.text(descLines, 17, yPos);
            doc.text(String(item.quantity), 133, yPos, { align: 'center' });
            doc.text('£' + item.unitPrice.toFixed(2), 165, yPos, { align: 'right' });
            doc.text('£' + item.lineTotal.toFixed(2), 193, yPos, { align: 'right' });
            yPos += (descLines.length * 4);
        }
        yPos += 2;
    }
    
    yPos += 5;
    if (yPos > 230) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Notes:', 15, yPos);
    yPos += 4;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('1. Estimate valid for 31 days', 15, yPos);
    yPos += 4;
    doc.text('2. Deposit of ' + depositPercent + '% is required to secure start date', 15, yPos);
    yPos += 4;
    doc.text('3. Extra works to be charged accordingly', 15, yPos);
    
    var customNotes = document.getElementById('customNotes').value;
    if (customNotes) {
        yPos += 4;
        var noteLines = doc.splitTextToSize('4. ' + customNotes, 180);
        doc.text(noteLines, 15, yPos);
        yPos += (noteLines.length * 4);
    }
    
    yPos += 8;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Subtotal', 130, yPos);
    doc.text('£' + subtotal.toFixed(2), 193, yPos, { align: 'right' });
    yPos += 5;
    doc.text('VAT', 130, yPos);
    doc.text('£' + vat.toFixed(2), 193, yPos, { align: 'right' });
    yPos += 6;
    doc.setFontSize(11);
    doc.text('£' + total.toFixed(2), 193, yPos, { align: 'right' });
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text('If you have any questions about this estimate, please contact traderbrotherslimited@gmail.com, or 07979309957.', 15, 285);
    doc.setFont(undefined, 'bold');
    doc.text('Thank you for your business', 15, 290);
    
    localStorage.setItem('traderBrosEstimateCount', estimateNumber);
    estimateNumber++;
    updateEstimateCounter();
    
    var filename = 'Estimate #' + estNumber + ' ' + projectAddress.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
    doc.save(filename);
    
    closePreview();
}

window.onclick = function(event) {
    var modal = document.getElementById('previewModal');
    if (event.target == modal) {
        closePreview();
    }
}
