# URL Checker - Excel URL Validation Application

A full-stack application that validates URLs in Excel files with server-side URL checking.

## Features

- ✅ Upload Excel files (.xlsx, .xls, .csv)
- ✅ Automatically detect and check all URLs in the spreadsheet
- ✅ Server-side URL validation (no CORS issues)
- ✅ Returns Excel cell location for broken links
- ✅ Displays detailed error reasons (DNS, timeout, HTTP status, etc.)
- ✅ Performance-optimized with HEAD and GET request fallback
- ✅ Beautiful, responsive UI

## Requirements

- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. **Install Node.js**
   - Download from [https://nodejs.org/](https://nodejs.org/)
   - Install the LTS (Long-Term Support) version
   - Verify installation:
     ```
     node --version
     npm --version
     ```

2. **Navigate to the project directory**
   ```
   cd url-check-server
   ```

3. **Install dependencies**
   ```
   npm install
   ```

## Running the Application

1. **Start the server**
   ```
   npm start
   ```

2. **Open in browser**
   - Open your browser and go to: `http://localhost:3000`
   - You should see the URL Checker application

3. **Upload an Excel file**
   - Click "Choose File" and select an Excel file
   - Click "Check URLs"
   - Wait for the results
   - Review broken links and their cell locations

## Project Structure

```
url-check-server/
├── package.json           # Project dependencies
├── server.js             # Node.js Express server
└── public/
    ├── index.html        # Main HTML page
    ├── style.css         # Styling
    └── script.js         # Frontend JavaScript
```

## How It Works

### Server-Side (Node.js)

1. **File Upload**: Accepts Excel files via multipart form data
2. **Excel Parsing**: Uses the `xlsx` library to parse the Excel file
3. **URL Detection**: Scans all cells for URLs (http:// or https://)
4. **URL Validation**: 
   - Attempts HEAD request first (faster)
   - Falls back to GET request if HEAD fails
   - Timeout: 5 seconds per URL
   - Follows redirects
5. **Error Reporting**: Categorizes failures (DNS, timeout, HTTP status, etc.)

### Frontend (HTML/CSS/JavaScript)

1. **File Selection**: Users select an Excel file
2. **Upload**: Sends file to server via FormData
3. **Status Display**: Shows loading indicator during processing
4. **Results Display**: 
   - Success/error message
   - Statistics (URLs found, checked, broken)
   - Detailed table of broken links with cell locations

## API Endpoints

### POST /api/check-urls
Accepts an Excel file and returns URL validation results.

**Request:**
- Content-Type: multipart/form-data
- Body: Excel file

**Response:**
```json
{
  "status": "success",
  "message": "All 5 URLs are working correctly!",
  "urlsChecked": 5,
  "urlsFound": 5,
  "brokenLinks": []
}
```

**Broken Link Response:**
```json
{
  "status": "success",
  "message": "Found 2 broken link(s) out of 10 URLs",
  "urlsChecked": 10,
  "urlsFound": 10,
  "brokenLinks": [
    {
      "cell": "A1",
      "url": "https://example-broken.com",
      "reason": "Domain not found"
    },
    {
      "cell": "B3",
      "url": "https://another-broken.com",
      "reason": "HTTP 404"
    }
  ]
}
```

## Supported URL Checking

The application checks URLs using:
- **HEAD requests**: Fast initial check
- **GET requests**: Fallback if HEAD fails
- **HTTP Status Codes**: 
  - 2xx: Success (working)
  - 3xx: Redirects (generally working with follow)
  - 4xx/5xx: Broken links
- **Error Detection**:
  - DNS resolution failures
  - Connection refused
  - Request timeouts
  - HTTP error status codes

## Supported File Formats

- `.xlsx` - Excel 2007+
- `.xls` - Excel 97-2003
- `.csv` - Comma-separated values

## Troubleshooting

### "npm command not found"
- Verify Node.js is installed correctly
- Restart your terminal/PowerShell after installation
- Add Node.js to your system PATH if needed

### Server won't start
- Make sure port 3000 is not in use
- Check file permissions in the project directory
- Try: `npm start` instead of `node server.js`

### URLs not being detected
- Ensure URLs start with `http://` or `https://`
- URLs must be in separate cells (not combined with text)

### Timeout errors
- Some servers may have strict timeouts
- The app waits up to 5 seconds per URL
- This is configurable in `server.js` (axios timeout parameter)

## Configuration

To change the port, set the PORT environment variable:
```
set PORT=8080
npm start
```

To modify timeout or other settings, edit `server.js`:
- Line 82: `timeout: 5000` - Change to adjust timeout (milliseconds)
- Line 83: `maxRedirects: 5` - Change to adjust redirect following

## License

ISC

## Support

For issues or questions, check the console output and error messages which provide detailed information about any problems.
