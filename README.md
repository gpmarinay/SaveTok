# TikTok Video Downloader

A clean, responsive web application that allows users to download TikTok videos without watermarks by leveraging the RapidAPI TikTok Downloader service.


## 💡 Features

* **Watermark-Free Downloads:** Fetch direct video download links without the TikTok watermark.
* **Instant Processing:** Fast conversion and fetch speeds using REST API integration.
* **Responsive UI:** Works seamlessly on desktop, tablet, and mobile browsers.
* **Zero Dependencies:** Built with vanilla HTML, CSS, and JavaScript—no heavy frameworks required.


## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (Fetch API / Async JavaScript)
* **API:** [RapidAPI - TikTok Downloader](https://rapidapi.com/)


## 🚀 Getting Started

### Prerequisites

To run or customize this project, you will need:

1. A modern web browser (Chrome, Firefox, Edge, Safari).
2. A free account on [RapidAPI](https://rapidapi.com/) to subscribe to a TikTok Downloader API and get an API key.


### Setup Instructions

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/tiktok-downloader.html.git
cd tiktok-downloader.html

```


2. **Configure your API Key:**
Open your HTML/JS file and replace the placeholder API key header with your RapidAPI key:
```javascript
headers: {
  'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY_HERE',
  'X-RapidAPI-Host': 'tiktok-downloader-api-host.p.rapidapi.com'
}

```


3. **Run the Application:**
* Double-click your `index.html` file to open it in any web browser, **or**
* Use an extension like **Live Server** in VS Code for local hosting.




## 📖 How It Works

1. Copy the URL of any public TikTok video.
2. Paste the link into the input field on the website.
3. Click the **Download** button.
4. The JavaScript `fetch()` function sends a request to the RapidAPI endpoint.
5. Once the API returns the media URL, a direct download/play link is displayed on the screen.


## ⚠️ Disclaimer

This tool is created for **educational purposes only**. Please respect the copyright and intellectual property rights of content creators. Do not re-upload or distribute downloaded videos without proper authorization from the original owner.
