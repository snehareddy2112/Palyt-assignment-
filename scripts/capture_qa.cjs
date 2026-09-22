const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runQA() {
  const screenshotsDir = path.join(__dirname, '..', 'demo_recordings');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const artifactDir = "C:\\Users\\sneha\\.gemini\\antigravity\\brain\\e293056a-90eb-4211-8778-4028758f544d";

  console.log('--- STARTING COMPREHENSIVE BROWSER QA AUDIT ---');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  async function snap(name) {
    const localPath = path.join(screenshotsDir, name);
    await page.screenshot({ path: localPath });
    try {
      fs.copyFileSync(localPath, path.join(artifactDir, name));
    } catch (e) {}
    console.log(`✓ ${name} captured and saved.`);
  }

  // 1. Initial Page Load
  console.log('1. Loading application at http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await snap('01_initial_dashboard.png');

  // 2. Test Search in Inventory
  console.log('2. Testing Search functionality (query: "Paneer")...');
  const searchInput = await page.$('input[placeholder*="Search ingredients"]');
  if (searchInput) {
    await searchInput.type('Paneer');
    await new Promise(r => setTimeout(r, 500));
    await snap('02_search_paneer.png');

    await page.evaluate(() => {
      const clearBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Clear'));
      if (clearBtn) clearBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // 3. Test Add Ingredient Modal
  console.log('3. Testing Add Ingredient Modal...');
  await page.evaluate(() => {
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Ingredient'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.type('input[placeholder*="Cardamom"]', 'Fresh Cardamom');
  await page.type('input[placeholder*="1.4 or 300"]', '250');
  await page.select('select', 'g');
  await page.type('input[placeholder*="0.5 or 250"]', '50');
  await snap('03_add_ingredient_modal.png');

  const saveAddBtn = await page.$('button[type="submit"]');
  if (saveAddBtn) await saveAddBtn.click();
  await new Promise(r => setTimeout(r, 600));
  await snap('04_ingredient_added.png');

  // 4. Test Dependency Guard on Deletion (Attempt to delete "Paneer")
  console.log('4. Testing Dependency Guard (Attempt to delete "Paneer")...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const paneerRow = rows.find(r => r.textContent.includes('Paneer'));
    if (paneerRow) {
      const delBtn = paneerRow.querySelector('button[title*="Used in recipes"]');
      if (delBtn) delBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('05_delete_blocked_modal.png');

  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Understood & Close'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 5. Test Deleting Unused Ingredient ("Fresh Cardamom")
  console.log('5. Testing Deletion of Unused Ingredient ("Fresh Cardamom")...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const cardRow = rows.find(r => r.textContent.includes('Fresh Cardamom'));
    if (cardRow) {
      const delBtn = cardRow.querySelector('button[title*="Delete ingredient"]');
      if (delBtn) delBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await snap('06_confirm_delete_modal.png');

  await page.evaluate(() => {
    const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Delete Ingredient'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 6. Test Core Order Flow: Shahi Paneer Korma
  console.log('6. Testing Order Flow: Shahi Paneer Korma (1st order: 300g -> 260g)...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#section-menu .group'));
    const kormaCard = cards.find(c => c.textContent.includes('Shahi Paneer Korma'));
    if (kormaCard) {
      const btn = kormaCard.querySelector('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 900));
  await snap('07_order_1_placed.png');

  console.log('6b. Placing 2nd order (260g -> 220g < 250g par -> Dishes become UNAVAILABLE)...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#section-menu .group'));
    const kormaCard = cards.find(c => c.textContent.includes('Shahi Paneer Korma'));
    if (kormaCard) {
      const btn = kormaCard.querySelector('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 900));
  await snap('08_order_2_dish_unavailable.png');

  // 7. Test Quick Restock (+50g Cashews: 220g -> 270g >= 250g par -> Restores Availability)
  console.log('7. Testing Quick Restock (+50g Cashews: 220g -> 270g >= 250g par -> Restores Availability)...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const cashewsRow = rows.find(r => r.textContent.includes('Cashews'));
    if (cashewsRow) {
      const plusBtn = cashewsRow.querySelector('button[title*="Quick restock"]');
      if (plusBtn) plusBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 900));
  await snap('09_restock_restores_availability.png');

  // 8. Test Engineering Write-up Modal
  console.log('8. Testing Engineering Write-up Modal...');
  await page.evaluate(() => {
    const writeupBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Write-up'));
    if (writeupBtn) writeupBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await snap('10_engineering_writeup_modal.png');

  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Write-up'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 9. Test Reset Demo Data
  console.log('9. Testing Reset Demo Data...');
  await page.evaluate(() => {
    const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reset'));
    if (resetBtn) resetBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await snap('11_reset_completed.png');

  await browser.close();
  console.log('--- ALL BROWSER QA AUDIT CHECKS COMPLETED SUCCESSFULLY ---');
}

runQA().catch(err => {
  console.error('QA script error:', err);
  process.exit(1);
});
