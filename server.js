const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to check URLs in Excel file
app.post('/api/check-urls', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    if (!worksheet) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No data found in Excel file' });
    }

    // Get all cells with data
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const brokenLinks = [];
    let urlsChecked = 0;
    let urlsFound = 0;

    // Iterate through all cells to find URLs
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];

        if (!cell || !cell.v) continue;

        const cellValue = String(cell.v).trim();

        // Check if cell contains a URL
        if (isUrl(cellValue)) {
          urlsFound++;
          const isBroken = await checkUrl(cellValue);

          if (isBroken) {
            // Convert row/col to Excel notation (A1, B2, etc.)
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            brokenLinks.push({
              cell: cellAddress,
              url: cellValue,
              reason: isBroken
            });
          }
          urlsChecked++;
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (brokenLinks.length === 0) {
      return res.json({
        status: 'success',
        message: `All ${urlsFound} URLs are working correctly!`,
        urlsChecked,
        urlsFound,
        brokenLinks: []
      });
    } else {
      return res.json({
        status: 'success',
        message: `Found ${brokenLinks.length} broken link(s) out of ${urlsFound} URLs`,
        urlsChecked,
        urlsFound,
        brokenLinks
      });
    }
  } catch (error) {
    console.error('Error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Helper function to check if a string is a URL
function isUrl(str) {
  try {
    const urlPattern = /^https?:\/\//i;
    return urlPattern.test(str);
  } catch {
    return false;
  }
}

// Helper function to check if URL is accessible
async function checkUrl(url) {
  try {
    // First try HEAD request (faster)
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: function(status) {
        return status < 500;
      }
    });

    // Check for successful status codes (2xx, 3xx are generally OK)
    if (response.status >= 200 && response.status < 400) {
      return false; // URL is working
    } else {
      return `HTTP ${response.status}`;
    }
  } catch (error) {
    // If HEAD fails, try GET request
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        maxRedirects: 5,
        validateStatus: function(status) {
          return status < 500;
        }
      });

      if (response.status >= 200 && response.status < 400) {
        return false; // URL is working
      } else {
        return `HTTP ${response.status}`;
      }
    } catch (getError) {
      // Return error reason
      if (getError.code === 'ENOTFOUND') {
        return 'Domain not found';
      } else if (getError.code === 'ECONNREFUSED') {
        return 'Connection refused';
      } else if (getError.code === 'ETIMEDOUT' || getError.message.includes('timeout')) {
        return 'Request timeout';
      } else if (getError.response) {
        return `HTTP ${getError.response.status}`;
      } else {
        return getError.message || 'Unknown error';
      }
    }
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Upload your Excel file to check URLs');
});
