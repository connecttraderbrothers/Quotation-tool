// PDF Generator using PDFShift API
const PDFSHIFT_API_KEY = 'sk_baa46c861371ec5f60ab2e83221fdac1ccce517b';

async function downloadQuote() {
    // Get the estimate container
    const element = document.getElementById('estimateContainer');
    if (!element || !element.innerHTML) {
        alert('Please generate an estimate preview first by clicking "Preview Quote"');
        return;
    }

    // Find the download button that was clicked
    const downloadBtns = document.querySelectorAll('.btn-secondary');
    let downloadBtn = null;
    for (let btn of downloadBtns) {
        if (btn.textContent.includes('Download PDF')) {
            downloadBtn = btn;
            break;
        }
    }

    // Show loading state
    let originalText = 'Download PDF';
    if (downloadBtn) {
        originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;
    }

    try {
        // Get the complete HTML including styles
        const htmlContent = generateCompleteHTML();
        
        // Generate filename
        const clientName = document.getElementById('clientName').value || 'Client';
        const projectAddress = document.getElementById('projectAddress').value || 'Project';
        const estNumber = String(estimateNumber).padStart(4, '0');
        const sanitizedAddress = projectAddress.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Estimate_${estNumber}_${sanitizedAddress}.pdf`;

        console.log('Sending request to PDFShift...');
        console.log('HTML content length:', htmlContent.length);

        // Send request to PDFShift API
        const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
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
            let errorData;
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
                throw new Error('Rate limit exceeded. You may have used your quota.');
            } else if (response.status === 400) {
                throw new Error('Bad Request: ' + (errorData.error || errorData.message || 'Invalid request'));
            } else {
                throw new Error((errorData.error || errorData.message) || `API Error (${response.status}): ${response.statusText}`);
            }
        }

        console.log('Receiving PDF from PDFShift...');

        // Get the PDF as a blob
        const blob = await response.blob();
        if (blob.size === 0) {
            throw new Error('Received empty PDF from server');
        }

        console.log('PDF blob size:', blob.size, 'bytes');
        console.log('PDF blob type:', blob.type);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);

        console.log('PDF downloaded successfully!');
        
        // Update estimate counter
        localStorage.setItem('traderBrosEstimateCount', estimateNumber);
        estimateNumber++;
        updateEstimateCounter();
        
        // Show success message
        setTimeout(() => {
            alert('✓ PDF downloaded successfully!\n\nFile: ' + filename);
        }, 200);

    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error.stack);
        let errorMessage = 'Error generating PDF\n\n';
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

// Generate complete HTML with embedded styles
function generateCompleteHTML() {
    const estimateContent = document.getElementById('estimateContainer').innerHTML;
    const styles = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        background: white;
        padding: 20px;
        color: #333;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #333;
      }
      .company-info {
        flex: 1;
      }
      .company-name {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
      }
      .company-name .highlight {
        color: #d4af37;
      }
      .company-details {
        font-size: 11px;
        line-height: 1.6;
        color: #666;
      }
      .logo-container {
        flex-shrink: 0;
      }
      .logo {
        width: 120px;
        height: auto;
        display: block;
      }
      .estimate-banner {
        background: linear-gradient(135deg, #bc9c22, #d4af37);
        padding: 15px 20px;
        margin-bottom: 25px;
        display: inline-block;
        font-weight: bold;
        font-size: 16px;
        color: white;
      }
      .info-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      .client-info {
        flex: 1;
      }
      .client-info h3 {
        font-size: 16px;
        color: #666;
        margin-bottom: 10px;
        font-weight: bold;
      }
      .client-info p {
        font-size: 15px;
        line-height: 1.6;
        color: #333;
        font-weight: 500;
      }
      .estimate-details {
        flex: 0 0 250px;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
      }
      .details-table td {
        padding: 8px 10px;
        font-size: 13px;
      }
      .detail-label {
        color: #666;
        text-align: left;
        width: 120px;
      }
      .detail-value {
        font-weight: bold;
        color: #333;
        text-align: left;
      }
      .expiry-date {
        background: linear-gradient(135deg, #bc9c22, #d4af37);
        padding: 5px 10px;
        display: inline-block;
        color: white;
        font-weight: bold;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin: 30px 0;
      }
      .items-table thead {
        background: #f5f5f5;
      }
      .items-table th {
        padding: 14px 12px;
        text-align: left;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        border-bottom: 2px solid #ddd;
      }
      .items-table th:nth-child(2),
      .items-table th:nth-child(3),
      .items-table th:nth-child(4) {
        text-align: right;
        width: 100px;
      }
      .items-table td {
        padding: 8px 12px;
        font-size: 12px;
        font-weight: normal;
        border-bottom: 1px solid #f0f0f0;
        color: #555;
      }
      .items-table td:nth-child(2),
      .items-table td:nth-child(3),
      .items-table td:nth-child(4) {
        text-align: right;
      }
      .section-header-row {
        background: #f0f0f0;
        font-weight: bold;
      }
      .section-header-row td {
        padding: 12px 12px;
        font-size: 13px;
        font-weight: 600;
        color: #333;
        border-top: 2px solid #bc9c22;
        border-bottom: 1px solid #bc9c22;
      }
      .notes-section {
        margin: 30px 0;
        padding: 20px;
        background: #f9f9f9;
        border-left: 3px solid #bc9c22;
      }
      .notes-section h3 {
        font-size: 13px;
        margin-bottom: 10px;
        color: #333;
      }
      .notes-section ol {
        margin-left: 20px;
        font-size: 12px;
        line-height: 1.8;
        color: #666;
      }
      .totals-section-preview {
        margin-top: 30px;
        display: flex;
        justify-content: flex-end;
      }
      .totals-box {
        width: 300px;
      }
      .total-row-preview {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        font-size: 13px;
      }
      .total-row-preview.subtotal {
        border-top: 1px solid #ddd;
      }
      .total-row-preview.vat {
        color: #666;
      }
      .total-row-preview.final {
        background: linear-gradient(135deg, #bc9c22, #d4af37);
        color: white;
        font-weight: bold;
        font-size: 16px;
        border-top: 2px solid #333;
        margin-top: 5px;
      }
      .footer-note {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        text-align: center;
        font-size: 11px;
        color: #666;
        font-style: italic;
      }
      .thank-you {
        margin-top: 15px;
        font-weight: bold;
        color: #333;
        font-size: 12px;
      }
      @media print {
        body {
          padding: 0;
        }
      }
    </style>
  `;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimate</title>
  ${styles}
</head>
<body>
  ${estimateContent}
</body>
</html>`;
}
