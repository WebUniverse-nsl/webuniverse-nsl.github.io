# WebUniverse project website

Static project page for **WebUniverse: Scaling Verified Training Data for Agentic Web Development**.

Project website: **https://webuniverse-nsl.github.io/**

The site presents task synthesis, executable environments, verification, training data and model results. It is served directly by GitHub Pages, with no build step or runtime dependencies.

## Local preview

```bash
python3 -m http.server 38765 --bind 127.0.0.1
```

Open `http://127.0.0.1:38765/`.

## Browser verification

With Playwright installed and the preview server running, run `node tests/browser.cjs`. Set `NODE_PATH` if Playwright is installed outside the repository. The checks cover interactions, dataset totals, local assets, keyboard navigation, mobile overflow and the fallback without JavaScript. Screenshots and a report are saved to the ignored `test-results/` directory.

`SITE_URL` overrides the preview URL. `CHROME_CDP` optionally connects the checks to an existing Chrome debugging endpoint, useful when the host's browser launch configuration requires it.

## GitHub Pages

Repository: `WebUniverse-nsl/webuniverse-nsl.github.io`. GitHub Pages deploys from `main`, `/ (root)`. Push changes to `main` to update the website. The `.nojekyll` file enables direct static-file serving. Relative asset paths support both organization homepages and project URLs.

## Content and maintenance

- `index.html`: research narrative, verified dataset counts, benchmark results and resource links.
- `styles.css`: responsive presentation.
- `site.js`: synthesis stages, dataset version selection, release charts and example selection. Content remains readable without JavaScript.
- `assets/`: the pipeline figure, archived screenshots and vector comparisons derived from the paper.
- `demos/`: self-contained browser previews of the recorded WebGen-Bench outputs.

Environments, data and models currently require manual approval on Hugging Face. Update the two access notes when that changes. Environment links point to `https://huggingface.co/datasets/WebUniverse-NSL/WebUniverse-Env`; the paper entry remains “Coming soon” until its public link is supplied. Do not infer authors, affiliations or a publication identifier.

## Sources and design references

Research content follows the current WebUniverse manuscript and verified release cards. The pipeline figure is a vector export of the author-supplied `矢量图/webuniverse-pipeline-20261012.drawio`, matching the current diagram design. Functional development shows the verbatim instruction from WebGen-Bench task 000020, the paper's full comparison artwork, optional embedded previews and the five recorded evaluation outcomes. Visual reproduction shows the complete-page appendix comparison with optional enlargement. These are evaluation illustrations, not training examples.

`assets/pdfs/functional-comparison.pdf` and `visual-full-pages.pdf` are byte-identical copies of the paper's `qualitative_webgen_full.pdf` and `qualitative_v2w_full.pdf`. `visual-paper-detail.pdf` embeds the top visual panel of `qualitative_cases.pdf`, clipped to `(0, 0, 456, 185)` PDF points using PyMuPDF `show_pdf_page`; no rasterization or resampling is involved. Functional outputs and the visual detail retain vector text and shapes. The original full visual appendix retains raster captures for Reference and Base, and an HTML-derived PDF for the trained model. The website now uses `visual-full-pages-vector-base.pdf` / `visual-full-vector-base.svg`: Base is exported from the archived HTML at its original 1920 × 4849 layout, with vector text and shapes outside its video section. Only pixels y=211–711 (the video section with its foreground UI) retain the original capture. Scroll-triggered content retains the recorded initial state. Reference and WebUniverse columns are pixel-identical to the original paper figure. The paper files are unchanged. The detail asset is retained for provenance but is no longer linked from the page. The files in `assets/comparisons/` are SVG exports of these PDFs using PyMuPDF `get_svg_image(text_as_path=True)`, retaining paths and original embedded images. The page displays them directly without a document viewer or format labels. Clicking a comparison opens a zoomable overlay; without JavaScript, the link opens the artwork directly.

The embedded functional outputs come from the archived task 000020 applications. The base preview inlines the original CSS and preserves its inactive controls: the evaluated app referenced an `app.js` that was absent, so that missing request is omitted rather than compiling or repairing the app. The 15K preview is a Vite production build of the unchanged archived React application, with the generated CSS and JavaScript inlined. Both previews are self-contained and have a restrictive content security policy; embedded frames use `sandbox="allow-scripts allow-forms"`. They require no backend or external network calls. The historical 2/5 and 5/5 results remain the recorded benchmark outcomes, not a fresh evaluation of the embedded previews.

The page organization was informed by [R2E-Gym](https://r2e-gym.github.io/), [SWE-smith](https://swesmith.com/) and [OS-Genesis](https://qiushisun.github.io/OS-Genesis-Home/): introduce synthesis, explain executable environments and verification, then connect the resulting data to agent training. Website code and styling are original; no third-party project assets or analytics are included.

Licensing for the project artifacts has not yet been announced. Upstream data terms are documented in their respective Hugging Face cards.

To reproduce the site Base panel, run `scripts/export_visual_base.py OUTPUT_DIR` with Python Playwright and PyMuPDF and an available `CHROME_CDP` endpoint, then `scripts/build_visual_base.py OUTPUT_DIR`. The scripts read the sibling archived application and paper sources without modifying them. Validation compares the other two columns pixel-for-pixel and checks that Base text is extractable. The full-size Base render matches the original video region exactly; outside it the mean RGB difference is below 0.5/255, including vector-rendering antialiasing.

The pipeline is exported with the official draw.io viewer renderer, loaded locally, and the source Geist fonts. Chromium produces `assets/pdfs/pipeline.pdf` with embedded fonts; PyMuPDF exports `assets/pipeline.svg` with glyph outlines so browser font availability cannot change the layout. The PDF has 151 vector drawings and no embedded bitmap images. The original supplied drawio is unchanged (SHA-256: `9edd2c36619631eac749f93a2463bc9f1fc268832d80124a4394a82c6cae1c87`).

The experiment section includes the main benchmark comparison, data-scaling curves, text/vision composition ablations, and the existing qualitative examples. Values follow the current manuscript tables. Scaling figures in `assets/results/` are vector exports of the three manuscript PDFs in `paper/overleaf/figures/scaling/`; `scaling-data.csv` preserves their source measurements. Results remain visible without JavaScript. Supplementary Level 2 results, behavior analysis, visual failure diagnostics, iterative-task analysis and verifier audits were removed from the website at the author's request.

All three experiment tables show one aggregate metric per benchmark: Vision2Web Level 1 average, WebGen-Bench overall accuracy, and the Web-Bench arithmetic mean of pass@1 and pass@2. Aggregate scores follow the manuscript’s reported rounding. Score columns are centered and use 17px text.
