const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('Starting Puppeteer UI automation test...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    const email = `test_ui_${Date.now()}@example.com`;
    const password = 'Password123';

    // 1. Go to register
    console.log('Navigating to Register page...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: '../scratch/ui_step_1_register.png' });

    // Fill registration form
    console.log('Filling out registration form...');
    await page.select('select', 'PROFESSIONAL');
    await page.type('input[placeholder="Jane"]', 'Jane');
    await page.type('input[placeholder="Doe"]', 'Doe');
    await page.type('input[placeholder="jane.doe@example.com"]', email);
    await page.type('input[placeholder="Min 6 characters"]', password);
    
    // Submit
    await page.click('button[type="submit"]');
    console.log('Submitted registration. Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: '../scratch/ui_step_2_create_org.png' });

    // 2. Create Organization
    console.log('Creating organization...');
    await page.type('input[name="organization_name"]', 'Jane Spa Retreat');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: '../scratch/ui_step_3_onboard_step1.png' });

    // 3. Onboarding Step 1
    console.log('Completing Onboarding Step 1...');
    // Inputs: firstName, lastName, companyName, workAddress are required.
    // They might be auto-filled, let's type if empty
    await page.type('input[name="firstName"]', 'Jane');
    await page.type('input[name="lastName"]', 'Doe');
    await page.type('input[name="companyName"]', 'Jane Spa Retreat');
    await page.type('input[name="workAddress"]', '456 Wellness Way');
    await page.click('.form-actions button.btn-primary');
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '../scratch/ui_step_4_onboard_step2.png' });

    // 4. Onboarding Step 2: Services
    console.log('Completing Onboarding Step 2...');
    // Click some checkboxes
    const checkboxes = await page.$$('.services-list input[type="checkbox"]');
    if (checkboxes.length > 0) {
      await checkboxes[0].click(); // Select Massage Therapy
      await checkboxes[4].click(); // Select Hair Services
    }
    await page.click('.form-actions button.btn-primary');
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '../scratch/ui_step_5_onboard_step3.png' });

    // 5. Onboarding Step 3: Hours
    console.log('Completing Onboarding Step 3...');
    await page.click('.form-actions button.btn-primary');
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '../scratch/ui_step_6_onboard_step4.png' });

    // 6. Onboarding Step 4: Photos
    console.log('Completing Onboarding Step 4...');
    await page.click('.form-actions button.btn-primary');
    console.log('Wizard complete. Waiting for Dashboard navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: '../scratch/ui_step_7_dashboard_initial.png' });

    // 7. Dashboard Initial state check
    console.log('On Dashboard page.');
    const initialSummary = await page.evaluate(() => {
      return document.querySelector('.services-summary-card')?.innerText;
    });
    console.log('Initial Dashboard Summary:', initialSummary);

    // 8. Open Edit Profile Modal
    console.log('Opening Edit Profile modal...');
    await page.click('.services-summary-card .btn-small'); // Click Edit Profile button
    await page.waitForSelector('.profile-edit-modal');
    await page.screenshot({ path: '../scratch/ui_step_8_edit_modal.png' });

    // 9. Add variant inside modal
    console.log('Adding variant to the first service...');
    // Let's expand the first service
    await page.click('.service-card:nth-child(1) .btn-expand-neon');
    await page.waitForSelector('.add-variant-box');
    await page.screenshot({ path: '../scratch/ui_step_9_modal_expanded.png' });

    // Fill in variant fields
    console.log('Typing variant name and price...');
    await page.type('input[placeholder="e.g., Swedish Massage, Deep Tissue"]', 'Deep Tissue Special');
    await page.type('.price-input-no-spin', '99.99');
    await page.screenshot({ path: '../scratch/ui_step_10_variant_filled.png' });

    // Click "Add Variant"
    console.log('Clicking Add Variant...');
    await page.click('.btn-add-variant');
    await page.waitForTimeout ? await page.waitForTimeout(1000) : await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '../scratch/ui_step_11_variant_added.png' });

    // Click "Save" at the bottom of the modal
    console.log('Clicking Save at the bottom of the modal...');
    await page.click('.modal-footer button.btn-primary');
    console.log('Saved modal. Waiting 3 seconds for modal close & dashboard update...');
    await page.waitForTimeout ? await page.waitForTimeout(3000) : await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: '../scratch/ui_step_12_dashboard_after_save.png' });

    // 10. Check dashboard after save
    const updatedSummary = await page.evaluate(() => {
      return document.querySelector('.services-summary-card')?.innerText;
    });
    console.log('Updated Dashboard Summary:', updatedSummary);

  } catch (err) {
    console.error('UI automation failed:', err);
    await page.screenshot({ path: '../scratch/ui_error.png' });
  } finally {
    await browser.close();
  }
}

runTest();
