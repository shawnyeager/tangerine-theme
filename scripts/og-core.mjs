// Shared Open Graph image renderer for tangerine-theme consumers.
//
// This is the single source of truth for OG card colors and rendering. Sites
// (shawnyeager.com, shawnyeager-share) install the theme as an npm dependency
// and import { OG_COLORS, renderOG } from here, then supply their own content
// discovery, per-site layout config, and file output. Satori cannot read CSS
// custom properties at build time, so OG_COLORS mirrors the dark side of the
// theme tokens by hand. Keep it in lockstep with assets/css/_tokens.css.

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// OG cards render on the site's dark-mode surface.
export const OG_COLORS = {
  bg: '#151b23', // --background-body (dark)
  title: '#f2f2f2', // --text-primary (dark)
  accent: '#FF5733', // --brand-orange (dark)
  domain: '#a5a5a5', // --text-meta (dark)
};

// Reference geometry. Sites may pass their own `layouts` to override.
// Preview at 50% (600×315) → multiply by 2 for 1× (1200×630).
export const DEFAULT_LAYOUTS = {
  landscape: {
    width: 1200,
    height: 630,
    paddingV: 60,
    paddingH: 80,
    title: { short: 112, medium: 96, long: 72, xlong: 60 },
    line: { width: 80, height: 6 },
    domain: 22,
    gap: 48,
    footerGap: 24,
  },
  // Same ratios as landscape for visual consistency.
  square: {
    width: 1200,
    height: 1200,
    paddingV: 114,
    paddingH: 80,
    title: { short: 213, medium: 183, long: 136, xlong: 112 },
    line: { width: 80, height: 11 },
    domain: 42,
    gap: 91,
    footerGap: 46,
  },
};

// Pick a title font size from character count. `breakpoints` is an ordered list
// of { maxLen, key } where key indexes into layout.title; the last entry is the
// catch-all for anything longer.
function pickTitleSize(title, layout, breakpoints) {
  const len = title.length;
  for (const bp of breakpoints) {
    if (len <= bp.maxLen) return layout.title[bp.key];
  }
  return layout.title[breakpoints[breakpoints.length - 1].key];
}

/**
 * Render a single OG card to a PNG buffer.
 *
 * @param {object}  opts
 * @param {string}  opts.title         Card title text.
 * @param {Buffer}  opts.fontData      Satoshi font buffer (OTF/TTF; Satori has no WOFF2).
 * @param {string}  opts.siteUrl       Domain label shown in the footer.
 * @param {object[]} opts.breakpoints  Ordered [{ maxLen, key }] title-size thresholds.
 * @param {'landscape'|'square'} [opts.format='landscape']
 * @param {object}  [opts.layouts=DEFAULT_LAYOUTS]
 * @param {boolean} [opts.balanceTitle=false]  Apply `text-wrap: balance` to the title.
 * @param {number}  [opts.scale=2]     Render multiplier for crispness.
 * @returns {Promise<Buffer>} PNG bytes.
 */
export async function renderOG({
  title,
  fontData,
  siteUrl,
  breakpoints,
  format = 'landscape',
  layouts = DEFAULT_LAYOUTS,
  balanceTitle = false,
  scale = 2,
}) {
  const layout = layouts[format] ?? layouts.landscape;
  const width = layout.width * scale;
  const height = layout.height * scale;
  const titleSize = pickTitleSize(title, layout, breakpoints);
  const padding = `${layout.paddingV * scale}px ${layout.paddingH * scale}px`;

  const titleStyle = {
    fontSize: `${titleSize * scale}px`,
    fontWeight: 700,
    fontFamily: 'Satoshi',
    color: OG_COLORS.title,
    lineHeight: 1.0,
    letterSpacing: '-0.03em',
  };
  if (balanceTitle) titleStyle.textWrap = 'balance';

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: OG_COLORS.bg,
        padding,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: `${layout.gap * scale}px`,
            },
            children: [
              {
                type: 'div',
                props: { style: titleStyle, children: title },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${layout.footerGap * scale}px`,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: `${layout.line.width * scale}px`,
                          height: `${layout.line.height * scale}px`,
                          backgroundColor: OG_COLORS.accent,
                          marginTop: `${2 * scale}px`, // Optical centering with domain text
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: `${layout.domain * scale}px`,
                          fontWeight: 700,
                          fontFamily: 'Satoshi',
                          color: OG_COLORS.domain,
                        },
                        children: siteUrl,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width,
    height,
    fonts: [{ name: 'Satoshi', data: fontData, weight: 700, style: 'normal' }],
  });

  return new Resvg(svg, { background: OG_COLORS.bg }).render().asPng();
}
