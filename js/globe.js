/* globe.js — D3 orthographic globe for the cities section
   Depends on: d3 v7, topojson v3 (loaded before this script)
   Entry point: initGlobe('#globe-svg')
*/
(function () {
  'use strict';

  const OR = '#E05A2A';
  const TL = '#2BB5A0';
  const FR = '#F2EEE6';

  const CITIES = [
    { name: 'London',      lon: -0.1,   lat: 51.5,  col: OR,  r: 5.5, launch: true,  ldir:  1 },
    { name: 'Los Angeles', lon: -118.2, lat: 34.0,  col: TL,  r: 5.5, launch: true,  ldir: -1 },
    { name: 'New York',    lon: -74.0,  lat: 40.7,  col: OR,  r: 5.5, launch: true,  ldir:  1 },
    { name: 'Miami',       lon: -80.2,  lat: 25.8,  col: TL,  r: 5.5, launch: true,  ldir:  1 },
    { lon:   2.3,  lat:  48.9, r: 2, launch: false },
    { lon:  13.4,  lat:  52.5, r: 2, launch: false },
    { lon:   4.9,  lat:  52.4, r: 2, launch: false },
    { lon:  -3.7,  lat:  40.4, r: 2, launch: false },
    { lon: -79.4,  lat:  43.7, r: 2, launch: false },
    { lon: -87.6,  lat:  41.9, r: 2, launch: false },
    { lon: 151.2,  lat: -33.9, r: 2, launch: false },
    { lon: 139.7,  lat:  35.7, r: 2, launch: false },
    { lon:  55.3,  lat:  25.2, r: 2, launch: false },
    { lon: 103.8,  lat:   1.4, r: 2, launch: false },
    { lon: -46.6,  lat: -23.5, r: 2, launch: false },
    { lon: -99.1,  lat:  19.4, r: 2, launch: false },
    { lon:  18.4,  lat: -33.9, r: 2, launch: false },
    { lon:  72.8,  lat:  19.1, r: 2, launch: false },
    { lon: -123.1, lat:  49.3, r: 2, launch: false },
    { lon:   2.2,  lat:  41.4, r: 2, launch: false },
    { lon:  37.6,  lat:  55.8, r: 2, launch: false },
    { lon:  28.9,  lat:  41.0, r: 2, launch: false },
    { lon: 116.4,  lat:  39.9, r: 2, launch: false },
    { lon:  77.2,  lat:  28.6, r: 2, launch: false },
    { lon: -43.1,  lat: -22.9, r: 2, launch: false },
    { lon:  31.2,  lat:  30.1, r: 2, launch: false },
    { lon:  36.8,  lat:  -1.3, r: 2, launch: false },
    { lon: -58.4,  lat: -34.6, r: 2, launch: false },
  ];

  function initGlobe(selector) {
    const svgEl = document.querySelector(selector);
    if (!svgEl) return;

    const W = 500, H = 500, CX = 250, CY = 250, R = 220;
    const svg = d3.select(svgEl);

    const projection = d3.geoOrthographic()
      .scale(R)
      .translate([CX, CY])
      .clipAngle(90)
      .rotate([37, -12, 0]);

    const path = d3.geoPath().projection(projection);

    /* --- defs --- */
    const defs = svg.append('defs');

    const oceanGrad = defs.append('radialGradient').attr('id', 'ocean-grad')
      .attr('cx', '42%').attr('cy', '38%').attr('r', '58%');
    oceanGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1a4a5e');
    oceanGrad.append('stop').attr('offset', '60%').attr('stop-color', '#0d2e3a');
    oceanGrad.append('stop').attr('offset', '100%').attr('stop-color', '#061820');

    const atmoGrad = defs.append('radialGradient').attr('id', 'atmo-grad')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    atmoGrad.append('stop').attr('offset', '80%').attr('stop-color', 'transparent');
    atmoGrad.append('stop').attr('offset', '92%').attr('stop-color', TL).attr('stop-opacity', '0.15');
    atmoGrad.append('stop').attr('offset', '100%').attr('stop-color', TL).attr('stop-opacity', '0');

    const edgeGrad = defs.append('radialGradient').attr('id', 'edge-grad')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    edgeGrad.append('stop').attr('offset', '65%').attr('stop-color', 'transparent');
    edgeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#000').attr('stop-opacity', '0.5');

    const hiGrad = defs.append('radialGradient').attr('id', 'hi-grad')
      .attr('cx', '38%').attr('cy', '32%').attr('r', '50%');
    hiGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fff').attr('stop-opacity', '0.07');
    hiGrad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent');

    defs.append('clipPath').attr('id', 'globe-clip')
      .append('circle').attr('cx', CX).attr('cy', CY).attr('r', R);

    /* --- launch-city glow gradients --- */
    CITIES.filter(c => c.launch).forEach((city, i) => {
      const glow = defs.append('radialGradient').attr('id', `glow${i}`)
        .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
      glow.append('stop').attr('offset', '0%').attr('stop-color', city.col).attr('stop-opacity', '0.55');
      glow.append('stop').attr('offset', '100%').attr('stop-color', city.col).attr('stop-opacity', '0');
    });

    /* --- base sphere --- */
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R)
      .attr('fill', 'url(#ocean-grad)');

    const g = svg.append('g').attr('clip-path', 'url(#globe-clip)');

    const graticule = d3.geoGraticule().step([15, 15]);
    const gratPath = g.append('path')
      .datum(graticule())
      .attr('fill', 'none')
      .attr('stroke', 'rgba(43,181,160,0.08)')
      .attr('stroke-width', '0.5');

    const landGroup = g.append('g');

    /* --- overlays --- */
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R + 14).attr('fill', 'url(#atmo-grad)');
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R).attr('fill', 'url(#edge-grad)');
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R).attr('fill', 'url(#hi-grad)');
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R)
      .attr('fill', 'none').attr('stroke', 'rgba(43,181,160,0.22)').attr('stroke-width', '1');

    /* --- city groups --- */
    const cityGroup = svg.append('g');
    const arcGroup  = svg.append('g').attr('clip-path', 'url(#globe-clip)');

    const launchCities = CITIES.filter(c => c.launch);

    const cityDots = CITIES.map((city, i) => {
      const g2 = cityGroup.append('g');
      if (city.launch) {
        const launchIdx = launchCities.indexOf(city);
        g2.append('circle').attr('r', city.r * 3.5).attr('fill', `url(#glow${launchIdx})`);
        g2.append('circle').attr('r', city.r).attr('class', `pulse-ring-${i}`)
          .attr('fill', 'none').attr('stroke', city.col).attr('stroke-width', '1').attr('opacity', '0');
      }
      g2.append('circle').attr('r', city.r).attr('fill', city.launch ? city.col : 'rgba(43,181,160,0.4)');
      if (city.launch) {
        g2.append('circle').attr('r', city.r * 0.38).attr('fill', FR);
        const d = city.ldir || 1;
        g2.append('line').attr('stroke', city.col).attr('stroke-width', '0.7').attr('opacity', '0.6')
          .attr('x1', 0).attr('y1', -city.r).attr('x2', d * 9).attr('y2', -12);
        g2.append('text')
          .attr('x', d * 11).attr('y', -9)
          .attr('font-family', "'Sora',sans-serif").attr('font-size', '11').attr('font-weight', '600')
          .attr('fill', FR).attr('text-anchor', d > 0 ? 'start' : 'end')
          .text(city.name);
      }
      return g2;
    });

    /* --- London–NY arc --- */
    const arcLonNY = arcGroup.append('path')
      .attr('fill', 'none').attr('stroke', OR)
      .attr('stroke-width', '1').attr('stroke-dasharray', '4,6').attr('opacity', '0.4');

    const packet = svg.append('circle').attr('r', 3).attr('fill', OR).attr('opacity', '0');

    function isVisible(lon, lat) {
      const rot = projection.rotate();
      const p = d3.geoOrthographic().rotate(rot).scale(1).translate([0, 0]);
      const [x, y] = p([lon, lat]);
      return x * x + y * y <= 1;
    }

    let frame = 0;

    function animate() {
      frame++;
      const rot = projection.rotate();
      projection.rotate([rot[0] + 0.025, rot[1], rot[2]]);
      gratPath.attr('d', path(graticule()));
      landGroup.selectAll('path').attr('d', path);

      const lonVis = isVisible(-0.1, 51.5);
      const nyVis  = isVisible(-74.0, 40.7);
      if (lonVis && nyVis) {
        arcLonNY.attr('d', path({ type: 'LineString', coordinates: [[-0.1, 51.5], [-74.0, 40.7]] })).attr('opacity', '0.4');
        const t    = (frame * 0.007) % 1;
        const mid  = d3.geoInterpolate([-0.1, 51.5], [-74.0, 40.7])(t);
        const midPt = projection(mid);
        if (midPt && isVisible(mid[0], mid[1])) {
          packet.attr('cx', midPt[0]).attr('cy', midPt[1]).attr('opacity', '0.9');
        } else {
          packet.attr('opacity', '0');
        }
      } else {
        arcLonNY.attr('opacity', '0');
        packet.attr('opacity', '0');
      }

      CITIES.forEach((city, i) => {
        if (!city.lon) return;
        const pt  = projection([city.lon, city.lat]);
        if (!pt) return;
        const vis = isVisible(city.lon, city.lat);
        const g2  = cityDots[i];
        g2.attr('transform', `translate(${pt[0]},${pt[1]})`).attr('opacity', vis ? 1 : 0);
        if (city.launch) {
          const phase     = (frame * 0.04 + i * 1.2) % (Math.PI * 2);
          const pProgress = Math.sin(phase) * 0.5 + 0.5;
          g2.select(`.pulse-ring-${i}`)
            .attr('r', city.r + pProgress * 18)
            .attr('opacity', Math.max(0, 0.55 - pProgress * 0.55));
        } else {
          const tw = 0.2 + Math.sin(frame * 0.04 + i * 2.3) * 0.15;
          g2.select('circle').attr('opacity', vis ? tw : 0);
        }
      });

      requestAnimationFrame(animate);
    }

    /* --- load world topology --- */
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(world => {
        const land = topojson.feature(world, world.objects.land);
        landGroup.selectAll('path')
          .data(land.features || [land])
          .enter().append('path')
          .attr('d', path)
          .attr('fill', 'rgba(42,110,75,0.75)')
          .attr('stroke', 'rgba(43,181,160,0.28)')
          .attr('stroke-width', '0.6');
        animate();
      })
      .catch(() => {
        landGroup.append('text')
          .attr('x', CX).attr('y', CY).attr('text-anchor', 'middle')
          .attr('fill', FR).attr('font-size', '12')
          .text('Loading map…');
        animate();
      });
  }

  /* auto-init on DOMContentLoaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initGlobe('#globe-svg'));
  } else {
    initGlobe('#globe-svg');
  }
})();
