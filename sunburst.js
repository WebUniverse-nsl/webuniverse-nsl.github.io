'use strict';

// SVG sunbursts use record counts directly; angles are shares of the full release.
window.renderWebUniverseSunburst = function (svg, readout, options) {
  const ns = 'http://www.w3.org/2000/svg';
  const {kind, version, counts, methodCounts} = options;
  const total = counts.reduce((sum, count) => sum + count, 0);
  const unit = kind === 'tasks' ? 'tasks' : kind === 'trajectories' ? 'trajectories' : 'task environments';
  const labels = ['Standalone', 'Iterative', 'Single-page', 'Multi-page', 'Multi-viewport'];
  const variantKeys = ['standalone', 'iterative', 'single-page', 'multi-page', 'multi-viewport'];
  // Soft blue / rose families, adapted from ColorBrewer Pastel1.
  // Match the text / vision hues in the pipeline; shade variants within each family.
  const variantColors = ['#c9ddec', '#e1ebf4', '#e4b2cb', '#efcada', '#f7e0e9'];
  const methodLabels = ['Independent sampling', 'Trajectory refinement'];
  const methodShort = ['', 'Refinement'];
  const methodColors = ['#d7e3f2', '#efc9a8'];
  const nodes = [];
  const center = 220;
  const outer = 198;
  let pinned = null;
  svg.replaceChildren();
  svg.setAttribute('aria-label', `${version}: ${total.toLocaleString('en-US')} ${unit}, grouped by task family and variant${methodCounts ? ', then collection method' : ''}`);

  function element(tag, attrs, text) {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const point = (radius, angle) => [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
  const coords = p => p.map(value => value.toFixed(3)).join(' ');
  function sector(start, end, inner, radius) {
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${coords(point(radius, start))} A ${radius} ${radius} 0 ${large} 1 ${coords(point(radius, end))} L ${coords(point(inner, end))} A ${inner} ${inner} 0 ${large} 0 ${coords(point(inner, start))} Z`;
  }
  function labelArc(start, end, radius) {
    const reverse = Math.sin((start + end) / 2) > 0;
    const a = reverse ? end : start;
    const b = reverse ? start : end;
    return `M ${coords(point(radius, a))} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} ${reverse ? 0 : 1} ${coords(point(radius, b))}`;
  }
  const defs = element('defs');
  const paths = element('g');
  const textLayer = element('g', {'pointer-events': 'none', 'font-family': 'Inter, Segoe UI, Arial, sans-serif'});
  svg.append(defs, paths, textLayer);

  function show(node) {
    nodes.forEach(item => {
      const related = !node || item.key.startsWith(node.key) || node.key.startsWith(item.key);
      item.path.setAttribute('opacity', related ? '1' : '.27');
      item.path.setAttribute('stroke', item === node ? '#203c59' : '#ffffff');
      item.path.setAttribute('stroke-width', item === node ? '2.5' : '2');
      item.path.setAttribute('aria-pressed', String(item === pinned));
    });
    const name = readout.querySelector('.sunburst-path');
    const value = readout.querySelector('.sunburst-value');
    if (node) {
      name.textContent = node.breadcrumb.join(' › ');
      value.textContent = `${node.count.toLocaleString('en-US')} ${unit} · ${(node.count / total * 100).toFixed(1)}% of ${version}`;
    } else {
      name.textContent = methodCounts ? 'Task family → Task variant → Collection method' : 'Task family → Task variant';
      value.textContent = 'Hover or select a segment to explore.';
    }
  }
  function addNode({key, breadcrumb, short, count, start, end, inner, radius, color, depth}) {
    if (!count) return;
    const node = {key, breadcrumb, count, depth};
    const path = element('path', {
      d: sector(start, end, inner, radius), fill: color, stroke: '#ffffff', 'stroke-width': 2,
      tabindex: '0', role: 'button', 'aria-pressed': 'false',
      'aria-label': `${breadcrumb.join(', ')}: ${count.toLocaleString('en-US')} ${unit}, ${(count / total * 100).toFixed(1)} percent of ${version}`,
      'data-node': key, 'data-value': count, 'data-depth': depth, 'data-share': count / total,
      class: 'sunburst-segment'
    });
    path.append(element('title', {}, `${breadcrumb.join(' / ')}: ${count.toLocaleString('en-US')} (${(count / total * 100).toFixed(1)}%)`));
    node.path = path;
    nodes.push(node);
    paths.append(path);
    path.addEventListener('pointerenter', () => show(node));
    path.addEventListener('focus', () => show(node));
    const toggle = () => { pinned = pinned === node ? null : node; show(pinned); };
    path.addEventListener('click', event => { event.stopPropagation(); toggle(); });
    path.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
      if (event.key === 'Escape') { event.preventDefault(); pinned = null; show(null); }
    });
    path.addEventListener('blur', () => show(pinned));
    const radiusMid = (inner + radius) / 2;
    // Keep every category visible; fit the label to its available arc.
    const availableLength = (end - start - .03) * radiusMid - 10;
    const fontSize = Math.min(depth === 1 ? 12 : 10.5, availableLength / Math.max(short.length * .57, 1));
    if (short) {
      const id = `${svg.id}-label-${nodes.length}`;
      defs.append(element('path', {id, d: labelArc(start + .015, end - .015, radiusMid)}));
      const text = element('text', {'font-size': fontSize, 'font-weight': depth === 1 ? 600 : 500, fill: '#25374a', dy: '0.35em', 'aria-hidden': 'true'});
      text.append(element('textPath', {href: `#${id}`, startOffset: '50%', 'text-anchor': 'middle'}, short));
      textLayer.append(text);
    }
  }

  let familyStart = -Math.PI / 2;
  for (const family of [{key: 'text', label: 'Text-grounded', indices: [0, 1], color: '#b3cde3'}, {key: 'vision', label: 'Vision-grounded', indices: [2, 3, 4], color: '#edbfd5'}]) {
    const count = family.indices.reduce((sum, index) => sum + counts[index], 0);
    const familyEnd = familyStart + count / total * Math.PI * 2;
    addNode({key: family.key, breadcrumb: [family.label], short: family.label, count, start: familyStart, end: familyEnd, inner: 64, radius: 106, color: family.color, depth: 1});
    let variantStart = familyStart;
    for (const index of family.indices) {
      const variantEnd = variantStart + counts[index] / total * Math.PI * 2;
      const key = `${family.key}/${variantKeys[index]}`;
      addNode({key, breadcrumb: [family.label, labels[index]], short: labels[index], count: counts[index], start: variantStart, end: variantEnd, inner: 106, radius: methodCounts ? 153 : outer, color: variantColors[index], depth: 2});
      if (methodCounts) {
        if (methodCounts[index].reduce((sum, n) => sum + n, 0) !== counts[index]) throw new Error('Sunburst collection counts do not match the task variant');
        let methodStart = variantStart;
        methodCounts[index].forEach((value, method) => {
          const methodEnd = methodStart + value / total * Math.PI * 2;
          addNode({key: `${key}/${method}`, breadcrumb: [family.label, labels[index], methodLabels[method]], short: methodShort[method], count: value, start: methodStart, end: methodEnd, inner: 153, radius: outer, color: methodColors[method], depth: 3});
          methodStart = methodEnd;
        });
      }
      variantStart = variantEnd;
    }
    familyStart = familyEnd;
  }
  textLayer.append(element('text', {x: center, y: center - 3, 'text-anchor': 'middle', 'font-size': 27, 'font-weight': 650, fill: '#192d45', 'data-sunburst-total': kind}, total.toLocaleString('en-US')));
  textLayer.append(element('text', {x: center, y: center + 20, 'text-anchor': 'middle', 'font-size': 11, fill: '#596a7c'}, kind === 'tasks' ? 'tasks' : kind === 'trajectories' ? 'trajectories' : 'environments'));
  svg.onpointerleave = () => show(pinned);
  svg.onclick = () => { pinned = null; show(null); };
  show(null);
};
