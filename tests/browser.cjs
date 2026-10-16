// Run with NODE_PATH pointing to a Playwright installation. No site build needed.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const base = process.env.SITE_URL || 'http://127.0.0.1:38765/';
  const output = path.join(__dirname, '..', 'test-results');
  fs.mkdirSync(output, {recursive:true});
  const browser = process.env.CHROME_CDP
    ? await chromium.connectOverCDP(process.env.CHROME_CDP)
    : await chromium.launch({headless:true});
  const errors = [];
  const page = await browser.newPage({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(base, {waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  await page.screenshot({path:path.join(output,'desktop.png'), fullPage:true});
  await page.screenshot({path:path.join(output,'desktop-first-screen.png')});
  assert.equal(await page.title(),'WebUniverse | Verified Training Data for Agentic Web Development');

  await page.locator('#stage-0').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#stage-1').getAttribute('aria-selected'),'true');
  assert.match(await page.locator('#stage-panel h3').innerText(),/executable workspaces/);
  await page.keyboard.press('End');
  assert.equal(await page.locator('#stage-3').getAttribute('aria-selected'),'true');
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#stage-0').getAttribute('aria-selected'),'true');

  for (const [version,total] of [['v2',20347],['v1',15000]]) {
    await page.locator(`[data-version="${version}"]`).click();
    const counts = await page.locator('[data-count]').allTextContents();
    assert.equal(counts.reduce((sum,text)=>sum+Number(text.replaceAll(',','')),0),total);
    assert.equal(await page.locator('#trajectory-total').innerText(),total.toLocaleString('en-US'));
  }
  assert.equal(await page.locator('.ablation-row:visible').count(),0);
  await page.locator('#show-ablations').check();
  assert.equal(await page.locator('.ablation-row:visible').count(),4);
  await page.locator('#show-ablations').uncheck();
  await page.locator('[data-example="visual"]').click();
  assert.equal(await page.locator('#visual-example').isVisible(),true);
  assert.equal(await page.locator('#functional-example').isVisible(),false);
  await page.locator('[data-example="functional"]').click();
  assert.equal(await page.locator('#functional-example').isVisible(),true);

  for (const src of await page.locator('img').evaluateAll(images=>images.map(image=>image.src))) {
    assert.equal((await page.request.get(src)).status(),200,src);
  }
  const brokenAnchors = await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href')));
  assert.deepEqual(brokenAnchors,[]);
  for (const width of [390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(base,{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true,`horizontal overflow at ${width}`);
    for (const img of await page.locator('img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(element=>element.decode());
      assert.equal(await img.evaluate(element=>element.naturalWidth>0),true);
    }
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,`width-${width}.png`),fullPage:true});
    if(width===390) await page.screenshot({path:path.join(output,'mobile-first-screen.png')});
  }
  const nojs = await browser.newPage({javaScriptEnabled:false, viewport:{width:390,height:900}});
  await nojs.goto(base,{waitUntil:'networkidle'});
  assert.equal(await nojs.locator('#functional-example').isVisible(),true);
  assert.equal(await nojs.locator('#visual-example').isVisible(),true);
  assert.equal(await nojs.locator('.ablation-row:visible').count(),4);
  assert.equal(await nojs.locator('a[href*="huggingface.co/datasets/WebUniverse-NSL/WebUniverse-Mix"]').first().isVisible(),true);
  assert.equal(await nojs.locator('.stage-tabs').isVisible(),false);
  assert.equal(await nojs.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
  assert.deepEqual(errors,[]);
  await browser.close();
  const report={url:base,widths:[390,768,1440],keyboardStages:true,datasetCounts:true,ablationToggle:true,exampleSwitch:true,localAssets:true,noJavaScriptFallback:true,consoleErrors:errors};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exit(1);});
