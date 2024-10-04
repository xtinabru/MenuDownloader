const puppeteer = require('puppeteer');
const { PDFDocument, rgb } = require('pdf-lib'); // Import pdf-lib

async function downloadMenu() {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: true });
    const webPage = await browser.newPage(); 

    // Navigate to the website
    await webPage.goto('https://toripolliisi.fi/ruokalista/', {
        waitUntil: 'networkidle2',
    });

    // Wait for the menu elements to load
    await webPage.waitForSelector('.elementor-price-list-title', { timeout: 5000 });

    // Extract the menu items
    const menuItems = await webPage.evaluate(() => {
        const items = [];
        
        // Extract dish names and prices
        const titles = document.querySelectorAll('.elementor-price-list-title');
        const prices = document.querySelectorAll('.elementor-price-list-price');

        titles.forEach((title, index) => {
            const dishTitle = title.innerText.trim();
            const dishPrice = prices[index]?.innerText.trim(); // Get the corresponding price
            
            items.push({ name: dishTitle, price: dishPrice });
        });

        return items;
    });

    console.log('Menu Items:', menuItems);

// Create a new PDF document
const pdfDoc = await PDFDocument.create();
let pdfPage = pdfDoc.addPage([600, 800]); // Create the first page
const fontSize = 12;
let yPosition = 750; // Starting position for the text

// Header
pdfPage.drawText('Menu', { x: 50, y: yPosition, size: 20, color: rgb(0, 0, 0) });
yPosition -= 30; // Move down after the header

// Write each menu item to the PDF
for (const item of menuItems) {
    // If yPosition is too low, add a new page
    if (yPosition < 50) {
        pdfPage = pdfDoc.addPage([600, 800]); // Add a new page
        yPosition = 750; // Reset y position for the new page
        pdfPage.drawText('Menu', { x: 50, y: yPosition, size: 20, color: rgb(0, 0, 0) }); // Add header on the new page
        yPosition -= 30; // Move down after the header
    }

    // Write the dish name and price
    pdfPage.drawText(`${item.name}: ${item.price}`, { x: 50, y: yPosition, size: fontSize, color: rgb(128 / 255, 0, 128/244) });
    yPosition -= 30; // Decrease yPosition for the next item
}

    // Save the PDF to a file
    const pdfBytes = await pdfDoc.save();
    const fs = require('fs');
    fs.writeFileSync('menu.pdf', pdfBytes);
    console.log('Menu has been saved to menu.pdf');

    // Close the browser
    await browser.close();
}

// Run the function
downloadMenu().catch(console.error);
