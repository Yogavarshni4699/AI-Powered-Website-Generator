const cheerio = require("cheerio");
const axios = require("axios");
const path = require('path');
const puppeteer = require('puppeteer');
const robotsParser = require('robots-parser');
const fs = require("fs");


async function templatePage(url){
    try {  
      let updatedUrl = new URL(url);
      updatedUrl.search = "";
      let scrapeURL = updatedUrl.href;
      scrapeURL = scrapeURL.replace(/\/+$/, "");
      let data;
      try{
        const response = await axios.get(scrapeURL);
        data = response.data
      }
      catch(err){
        console.log("error", err)
      }

      const $ = cheerio.load(data);
  
      const isNextJs = $('script[src*="next"]').length > 0;
      if (isNextJs) {
        console.log("next js")
      }
      

      const browser = await puppeteer.launch({timeout: 60000});
      const page = await browser.newPage();
      page.on('requestfailed', () => {});
      await page.goto(scrapeURL, { waitUntil: "networkidle2", timeout: 60000 });
     
      const links = await page.evaluate((scrapeURL) => {
        const anchors = Array.from(document.querySelectorAll("a"));
        const linkSet = new Set();
        linkSet.add(scrapeURL)
        const maxLinks = 5;
  
        for (let i = 0; i < anchors.length; i++) {
          const href = anchors[i].href;
          if (href.startsWith(scrapeURL) && !linkSet.has(href) && (!href.includes("#"))) {
            const updatedLink = href.replace(/\/+$/, "");
            linkSet.add(updatedLink);
            if (linkSet.size >= maxLinks) break;
          }
        }
  
        return Array.from(linkSet);
      }, scrapeURL); 
      console.log("Found links:", links.length);
  
     console.log("links", links)
     template(links)
    } catch (err) {
      console.log("error", err);
      return
    }
}

async function template(urls){
    try {
        //  ******************************** Scrape the code start ********************************
        const fetchBaseUrl = new URL(urls[0]);
        const baseUrl = fetchBaseUrl.origin;
    
        const urlFolderName = baseUrl
        .replace(/https?:\/\//, "")
        .replace(/[^\w\-]/g, "_");

        let robots;
        async function fetchRobotsTxt() {
          try {
            const { data } = await axios.get(`${baseUrl}/robots.txt`);
            robots = robotsParser(`${baseUrl}/robots.txt`, data);
          } catch (error) {
            console.error("Error fetching robots.txt:", error);
            robots = robotsParser(`${baseUrl}/robots.txt`, "");
          }
        }
        await fetchRobotsTxt();

    for(const url of urls) {
        try {
          if (!robots.isAllowed(url, "User-Agent")) {
            continue
          }

          const scraperType = await scrape(url, urlFolderName);

          await new Promise((resolve) => setTimeout(resolve, 1000));
         
        }catch (err) {
          console.log("Error scraping page:", err);
        }     
        }

    console.log("check on folder name" , urlFolderName)


return
    
      } catch (err) {
        console.log("error ", err);
        return;
      }
}

async function scrape(url, urlFolderName){
    //  ******************** Start ********************
  
    const usePuppeteer = await shouldUsePuppeteer(url);
    const fetchBaseUrl = new URL(url);
    var baseUrl = fetchBaseUrl.origin;

      if (usePuppeteer) {
        await scrapePageWithPuppeteer(url);
      } else {
        await scrapePageWithAxios(url);
      }
  
    //  ********************* End ********************
  
    // Function to create directory structure based on URL path
    function createDirStructure(url) {
      
      // const urlFolderName = baseUrl.replace(/https?:\/\//, '').replace(/[^\w\-]/g, '_');
      const scrapeDir = path.join(__dirname, urlFolderName);
      let dirPath = scrapeDir;
      const urlPath = new URL(url).pathname.replace(/\/$/, '').split('/');
  
      urlPath.forEach(part => {
        dirPath = path.join(dirPath, part);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
      });
  
      const assetsDir = path.join(dirPath, 'assets');
      const cssDir = path.join(dirPath, 'css');
      const jsDir = path.join(dirPath, 'js');
  
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
      if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir);
      if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir);
  
      return { dirPath, assetsDir, cssDir, jsDir };
    }
  
    // Function to download a file and save it to the local file system
    async function downloadFile(url, outputPath) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, response.data);
        console.log(`Downloaded: ${url}`);
      } catch (err) {
        console.error(`Error downloading ${url}:`, err);
      }
    }
  
    // Remove the Google Tag Manager
   async function removeGoogleTagManager($) {
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      const scriptSrc = $(element).attr('src');
     
      // Check for inline GTM script
      if (scriptContent && (
        scriptContent.includes("gtag('config'") ||
        scriptContent.includes("gtag('js',") ||
        scriptContent.includes('window.dataLayer') ||
        scriptContent.includes("googletagmanager.com/gtm.js") ||
        scriptContent.includes("googletagmanager.com/ns.html") ||
        scriptContent.includes("gtm.start")
      )) {
        $(element).remove();
      }
 
      // Check for external GTM script source
      if (scriptSrc && (
        scriptSrc.includes('googletagmanager.com/gtag/js') ||
        scriptSrc.includes('googletagmanager.com/gtm.js')
      )) {
        $(element).remove();
      }
    });
 
    // Remove any GTM noscript if present
    $('noscript').each((index, element) => {
      const noscriptContent = $(element).html();
      if (noscriptContent && noscriptContent.includes('googletagmanager.com/ns.html')) {
        $(element).remove();
      }
    });
    }

    // Improved heuristic to determine if a URL should be scraped with Puppeteer
    async function shouldUsePuppeteer(url) {
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
  
        // Check for common dynamic content indicators
        const hasDynamicContent = [
          'script[src*="angular"]',
          'script[src*="react"]',
          'script[src*="vue"]',
          'script[src*="next"]',
        ].some((selector) => $(selector).length > 0);
  
        return hasDynamicContent;
      } catch (err) {
        console.error(`Error checking for dynamic content at ${url}:`, err);
        return true; // Default to using Puppeteer on error
      }
    }
  
    async function downloadPage(url, content, dirPath) {
      const filePath = path.join(dirPath, 'index.html');
      fs.writeFileSync(filePath, content);
      console.log(`Saved: ${url} as ${filePath}`);
    }
  
    // Function to scrape a single page using Puppeteer for dynamic content
    async function scrapePageWithPuppeteer(url) {
      let browser;
      try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'load' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const content = await page.content();
        const $ = cheerio.load(content);
        await removeGoogleTagManager($);
        const cssFiles = [];
        const jsFiles = [];
        const dirs = createDirStructure(url);
        await processAndDownloadAssets($, url, dirs, cssFiles, jsFiles);
        const combinedCss = await combineCssFiles(cssFiles, url, dirs.cssDir);
        const combinedJs = await combineJsFiles(jsFiles, url, dirs.jsDir);
        $('head').append(`<link rel="stylesheet" href="css/${combinedCss}">`);
        $('body').append(`<script src="js/${combinedJs}"></script>`);
  
        const updatedHtml = $.html();
        await downloadPage(url, updatedHtml, dirs.dirPath);
      } catch (err) {
        console.error(`Error scraping ${url} with Puppeteer:`, err);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }
  
    // Function to scrape a single page using Axios and Cheerio
    async function scrapePageWithAxios(url) {
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        await removeGoogleTagManager($);
        const cssFiles = [];
        const jsFiles = [];
        const dirs = createDirStructure(url);
        await processAndDownloadAssets($, url, dirs, cssFiles, jsFiles);
        const combinedCss = await combineCssFiles(cssFiles, url, dirs.cssDir);
        const combinedJs = await combineJsFiles(jsFiles, url, dirs.jsDir);
        $('head').append(`<link rel="stylesheet" href="css/${combinedCss}">`);
        $('body').append(`<script src="js/${combinedJs}"></script>`);
  
        const updatedHtml = $.html();
        await downloadPage(url, updatedHtml, dirs.dirPath);
      } catch (err) {
        console.error(`Error scraping ${url} with Axios:`, err);

      }
    }
  
    // Function to process and download assets
    async function processAndDownloadAssets($, pageUrl, dirs, cssFiles, jsFiles) {
      const assetsToDownload = [];
  
      const processUrl = (url, type) => {
        const absoluteUrl = new URL(url, pageUrl).href;
        let assetPath, relativePath;
        const parsedUrl = new URL(absoluteUrl);
        const updateName = path.basename(parsedUrl.pathname);
  
        if (type === 'css') {
          assetPath = path.join(dirs.cssDir, path.basename(absoluteUrl));
          relativePath = path.join('css', path.basename(absoluteUrl));
        } else if (type === 'js') {
          assetPath = path.join(dirs.jsDir, path.basename(absoluteUrl));
          relativePath = path.join('js', path.basename(absoluteUrl));
        } else {
          assetPath = path.join(dirs.assetsDir, updateName);
          relativePath = path.join('assets', updateName);
        }
  
        assetsToDownload.push({ url: absoluteUrl, path: assetPath });
        return relativePath.replace(/\\/g, '/');
      };
  
      $('link[rel="stylesheet"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          cssFiles.push(href);
          $(element).remove();
        }
      });
  
      $('script[src]').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          jsFiles.push(src);
          $(element).remove();
        }
      });
  
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          const relativePath = processUrl(src);
          $(element).attr('src', relativePath);
        }
      });
  
      $('video source').each((_, element) => {
        const src = $(element).attr('src');
        if (src) {
          const relativePath = processUrl(src);
          $(element).attr('src', relativePath);
        }
      });
  
      $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const relativePath = processUrl(href);
          $(element).attr('href', relativePath);
        }
      });
  
      $('[style]').each((_, element) => {
        const style = $(element).attr('style');
        const matches = style ? style.match(/url\(["']?(.*?)["']?\)/g) : [];
        if (matches) {
          matches.forEach(match => {
            const url = match.match(/url\(["']?(.*?)["']?\)/)[1];
            const newUrl = processUrl(url);
            $(element).attr('style', style.replace(url, newUrl));
          });
        }
      });
  
      await Promise.all(assetsToDownload.map(asset => downloadFile(asset.url, asset.path)));
    }
  
    // Function to combine multiple CSS files into one
    async function combineCssFiles(cssFiles, pageUrl, cssDir) {
      const combinedCssFileName = 'index.css';
      const combinedCssFilePath = path.join(cssDir, combinedCssFileName);
      let combinedCssContent = '';
  
      for (const cssFile of cssFiles) {
        try {
          var cssUrl = new URL(cssFile, baseUrl).href;
          const response = await axios.get(cssUrl);
          combinedCssContent += response.data + '\n';
        } catch (err) {
          console.error(`Error fetching CSS file ${cssUrl}:`, err);
        }
      }
  
      fs.writeFileSync(combinedCssFilePath, combinedCssContent);
      console.log(`Combined CSS saved as ${combinedCssFilePath}`);
      return combinedCssFileName;
    }
  
    async function combineJsFiles(jsFiles, pageUrl, jsDir) {
      const combinedJsFileName = 'index.js';
      const combinedJsFilePath = path.join(jsDir, combinedJsFileName);
      let combinedJsContent = '';
  
      for (const jsFile of jsFiles) {
        try {
          var jsUrl = new URL(jsFile, baseUrl).href;
          const response = await axios.get(jsUrl);
          combinedJsContent += response.data + '\n';
        } catch (err) {
          console.error(`Error fetching JS file ${jsUrl}:`, err);
        }
      }
  
      fs.writeFileSync(combinedJsFilePath, combinedJsContent);
      console.log(`Combined JS saved as ${combinedJsFilePath}`);
      return combinedJsFileName;
    }
    return usePuppeteer
}


(async function runScraping(){
  const urls = [
      "https://www.amberflo.io/",
      "https://www.vendr.com",
      "https://www.swan.io/",
    
  ];

  try {
      await Promise.all(urls.map(url => templatePage(url)));
      console.log("Scraping completed for all URLs.");
  } catch (err) {
      console.error("Error during scraping:", err);
  }
})();