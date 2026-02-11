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

# URL Checker

Excel URL validation server and a small frontend for uploading spreadsheets and checking links.

## Summary

This project provides a Node.js Express server and a static frontend that lets users upload an Excel or CSV file. The server parses the first worksheet, finds cell values that start with `http://` or `https://`, and validates each URL (HEAD then GET fallback). It reports counts and any broken links with their Excel cell locations.

## Requirements

- Node.js (tested with Node 16+)
- npm

## Install

1. Install dependencies:

```bash
npm install
```

## Run

Start the server (default port 3000):

```bash
npm start
# or for local development
npm run dev
```

Open http://localhost:3000 in your browser.

## What the app does

- Accepts an uploaded file via `POST /api/check-urls` (multipart/form-data, field name `file`).
- Parses the first worksheet in the Excel file (or CSV).
- Detects cell values beginning with `http://` or `https://`.
- For each URL: tries a `HEAD` request; if that fails, tries `GET`.
- Uses a 5 second timeout and follows up to 5 redirects (configurable in `server.js`).
- Returns a JSON result that includes `urlsFound`, `urlsChecked`, and an array `brokenLinks` with { cell, url, reason } objects.

Uploaded files are stored temporarily in `uploads/` by `multer` and removed after processing.

## API

### POST /api/check-urls

Request: multipart form with file in field `file`.

Successful response examples:

Working URLs (no broken links):

```json
{
  "status": "success",
  "message": "All 5 URLs are working correctly!",
  "urlsChecked": 5,
  "urlsFound": 5,
  "brokenLinks": []
}
```

When broken links are found:

```json
{
  "status": "success",
  "message": "Found 2 broken link(s) out of 10 URLs",
  "urlsChecked": 10,
  "urlsFound": 10,
  "brokenLinks": [
    { "cell": "A1", "url": "https://example-broken.com", "reason": "Domain not found" }
  ]
}
```

Error responses use HTTP error codes and include an `error` message in the body.

## Supported file formats

- `.xlsx`, `.xls`, `.csv`

## Configuration

- Default port: `3000`. Override with `PORT` environment variable.
- Request timeout and redirects are set in `server.js` (axios options).

## Project structure

- `server.js` — Express server and API implementation
- `public/` — static frontend (`index.html`, `script.js`, `style.css`)
- `package.json` — dependencies and start scripts

## Dependencies

- express
- multer
- xlsx
- axios

## Troubleshooting

- If the server fails to start, check that port 3000 is free and Node.js is installed.
- Ensure uploaded URLs begin with `http://` or `https://` to be detected.

## Notes / Limitations

- Only the first worksheet is checked.
- Cells that contain URLs mixed with other text may not be detected.
- The server returns a `status: "success"` response even when broken links are present (see `brokenLinks` array for details).

---

If you want, I can also:
- add a simple health endpoint, or
- add an option to check all worksheets, or
- include a small script to run a local test upload.
