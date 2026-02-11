document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const submitBtn = document.getElementById('submitBtn');
  const fileNameDisplay = document.getElementById('fileName');
  const resultContainer = document.getElementById('resultContainer');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultContent = document.getElementById('resultContent');
  const backBtn = document.getElementById('backBtn');

  // File input change handler
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name;
      const isValidFile = /\.(xlsx|xls|csv)$/i.test(fileName);

      if (isValidFile) {
        fileNameDisplay.textContent = `✓ Selected: ${fileName}`;
        fileNameDisplay.classList.add('success');
        submitBtn.disabled = false;
      } else {
        fileNameDisplay.textContent = '✗ Please select a valid Excel file (.xlsx, .xls, or .csv)';
        fileNameDisplay.classList.remove('success');
        submitBtn.disabled = true;
        fileInput.value = '';
      }
    }
  });

  // Form submission
  submitBtn.addEventListener('click', async function() {
    const file = fileInput.files[0];
    if (!file) return;

    // Show loading state
    resultContainer.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    resultContent.classList.add('hidden');

    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/check-urls', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      // Hide loading spinner
      loadingSpinner.classList.add('hidden');
      resultContent.classList.remove('hidden');

      if (response.ok) {
        displayResults(data);
      } else {
        displayError(data.error || 'An error occurred while processing your file');
      }
    } catch (error) {
      loadingSpinner.classList.add('hidden');
      resultContent.classList.remove('hidden');
      displayError('Network error: ' + error.message);
    }
  });

  // Back button handler
  backBtn.addEventListener('click', function() {
    resultContainer.classList.add('hidden');
    fileInput.value = '';
    fileNameDisplay.textContent = '';
    fileNameDisplay.classList.remove('success');
    submitBtn.disabled = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function displayResults(data) {
    const resultMessage = document.getElementById('resultMessage');
    const urlsFoundDisplay = document.getElementById('urlsFound');
    const urlsCheckedDisplay = document.getElementById('urlsChecked');
    const brokenCountDisplay = document.getElementById('brokenCount');
    const brokenLinksSection = document.getElementById('brokenLinksSection');

    // Set message
    resultMessage.textContent = data.message;
    resultMessage.className = 'result-message ' + (data.brokenLinks.length === 0 ? 'success' : 'error');

    // Set stats
    urlsFoundDisplay.textContent = data.urlsFound;
    urlsCheckedDisplay.textContent = data.urlsChecked;
    brokenCountDisplay.textContent = data.brokenLinks.length;

    // Display broken links if any
    if (data.brokenLinks.length > 0) {
      const tbody = document.getElementById('brokenLinksTable');
      tbody.innerHTML = '';

      data.brokenLinks.forEach(link => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${escapeHtml(link.cell)}</td>
          <td><a href="${escapeHtml(link.url)}" target="_blank" title="${escapeHtml(link.url)}">${escapeHtml(truncateUrl(link.url))}</a></td>
          <td>${escapeHtml(link.reason)}</td>
        `;
        tbody.appendChild(row);
      });

      brokenLinksSection.classList.remove('hidden');
    } else {
      brokenLinksSection.classList.add('hidden');
    }
  }

  function displayError(errorMessage) {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.textContent = '❌ ' + errorMessage;
    resultMessage.className = 'result-message error';

    document.getElementById('urlsFound').textContent = '0';
    document.getElementById('urlsChecked').textContent = '0';
    document.getElementById('brokenCount').textContent = '0';
    document.getElementById('brokenLinksSection').classList.add('hidden');
  }

  function truncateUrl(url, maxLength = 60) {
    if (url.length <= maxLength) {
      return url;
    }
    return url.substring(0, maxLength - 3) + '...';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
