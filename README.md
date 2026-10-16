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
- `site.js`: synthesis stages, dataset version selection, ablation visibility and example selection. Content remains readable without JavaScript.
- `assets/`: the project's own paper figures and recorded qualitative screenshots.

Data and models currently require manual approval on Hugging Face. Update the two access notes when that changes. Environment and paper entries remain “Coming soon” until the corresponding public links are supplied. Do not infer authors, affiliations or a publication identifier.

## Sources and design references

Research content follows the current WebUniverse manuscript and verified release cards. The pipeline and qualitative figures are unchanged copies of the paper assets. The two phone-operator screenshots are recorded WebGen-Bench outputs: base model versus the paper's 15K model. They are evaluation illustrations, not training examples.

The page organization was informed by [R2E-Gym](https://r2e-gym.github.io/), [SWE-smith](https://swesmith.com/) and [OS-Genesis](https://qiushisun.github.io/OS-Genesis-Home/): introduce synthesis, explain executable environments and verification, then connect the resulting data to agent training. Website code and styling are original; no third-party project assets or analytics are included.

Licensing for the project artifacts has not yet been announced. Upstream data terms are documented in their respective Hugging Face cards.
