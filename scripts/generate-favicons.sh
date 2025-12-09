#!/bin/bash
#
# Generate all favicon assets for sites using tangerine-theme
#
# Usage:
#   ./generate-favicons.sh solid /path/to/static/
#   ./generate-favicons.sh outlined /path/to/static/
#
# Generates:
#   PWA icons (62.5% square for Google circular crop):
#   - apple-touch-icon.png (180x180)
#   - icon-192.png (192x192)
#   - icon-512.png (512x512)
#   - icon-maskable.png (512x512)
#
#   Browser favicons (full bleed, no padding):
#   - favicon-16x16.png (16x16)
#   - favicon-32x32.png (32x32)
#   - favicon-96x96.png (96x96)
#   - favicon.ico (16x16, 32x32, 48x48 multi-resolution)

set -e

STYLE="${1:-solid}"
OUTPUT_DIR="${2:-.}"

# Brand color
ORANGE="#F84200"

# Validate style
if [[ "$STYLE" != "solid" && "$STYLE" != "outlined" ]]; then
    echo "Error: Style must be 'solid' or 'outlined'"
    echo "Usage: $0 <solid|outlined> <output_directory>"
    exit 1
fi

# Validate output directory
if [[ ! -d "$OUTPUT_DIR" ]]; then
    echo "Error: Output directory does not exist: $OUTPUT_DIR"
    exit 1
fi

echo "Generating $STYLE favicons in $OUTPUT_DIR"

# Generate PWA icon with 62.5% padding for Google circular crop
generate_pwa_icon() {
    local size=$1
    local output=$2

    # Calculate dimensions (62.5% square, centered)
    local square_size=$((size * 5 / 8))
    local padding=$(((size - square_size) / 2))

    # For outlined style, stroke width is 12.5% of canvas (matching SVG ratio of 4/32)
    local stroke_width=$((size / 8))

    # Calculate rectangle end coordinates
    local end=$((padding + square_size - 1))

    if [[ "$STYLE" == "solid" ]]; then
        magick -size "${size}x${size}" xc:white \
            -fill "$ORANGE" \
            -draw "rectangle $padding,$padding $end,$end" \
            "$output"
    else
        local half_stroke=$((stroke_width / 2))
        local inner_padding=$((padding + half_stroke))
        local inner_end=$((end - half_stroke))

        magick -size "${size}x${size}" xc:white \
            -fill none \
            -stroke "$ORANGE" \
            -strokewidth "$stroke_width" \
            -draw "rectangle $inner_padding,$inner_padding $inner_end,$inner_end" \
            "$output"
    fi

    echo "  Created: $output (${size}x${size}, padded for PWA)"
}

# Generate browser favicon with full bleed (no padding)
# Matches the SVG: 28x28 square centered in 32x32 viewport (scaled proportionally)
generate_favicon() {
    local size=$1
    local output=$2

    # Match SVG proportions: 28/32 = 87.5% of canvas
    local square_size=$((size * 7 / 8))
    local padding=$(((size - square_size) / 2))

    # For outlined style, stroke width is 4/32 = 12.5% of canvas
    local stroke_width=$((size / 8))
    # Minimum stroke width of 1px for small sizes
    if [[ $stroke_width -lt 1 ]]; then
        stroke_width=1
    fi

    local end=$((padding + square_size - 1))

    if [[ "$STYLE" == "solid" ]]; then
        magick -size "${size}x${size}" xc:none \
            -fill "$ORANGE" \
            -draw "rectangle $padding,$padding $end,$end" \
            "$output"
    else
        local half_stroke=$((stroke_width / 2))
        local inner_padding=$((padding + half_stroke))
        local inner_end=$((end - half_stroke))

        magick -size "${size}x${size}" xc:none \
            -fill none \
            -stroke "$ORANGE" \
            -strokewidth "$stroke_width" \
            -draw "rectangle $inner_padding,$inner_padding $inner_end,$inner_end" \
            "$output"
    fi

    echo "  Created: $output (${size}x${size}, full bleed)"
}

echo ""
echo "PWA icons (padded for circular crop):"
generate_pwa_icon 180 "$OUTPUT_DIR/apple-touch-icon.png"
generate_pwa_icon 192 "$OUTPUT_DIR/icon-192.png"
generate_pwa_icon 512 "$OUTPUT_DIR/icon-512.png"
generate_pwa_icon 512 "$OUTPUT_DIR/icon-maskable.png"

echo ""
echo "Browser favicons (full bleed):"
generate_favicon 16 "$OUTPUT_DIR/favicon-16x16.png"
generate_favicon 32 "$OUTPUT_DIR/favicon-32x32.png"
generate_favicon 96 "$OUTPUT_DIR/favicon-96x96.png"

# Generate favicon-48x48.png for ICO
generate_favicon 48 "$OUTPUT_DIR/favicon-48x48.png"

echo ""
echo "Multi-resolution ICO:"
magick "$OUTPUT_DIR/favicon-16x16.png" "$OUTPUT_DIR/favicon-32x32.png" "$OUTPUT_DIR/favicon-48x48.png" "$OUTPUT_DIR/favicon.ico"
echo "  Created: $OUTPUT_DIR/favicon.ico (16x16, 32x32, 48x48)"

# Clean up temp file
rm "$OUTPUT_DIR/favicon-48x48.png"

echo ""
echo "Done! Generated 8 favicon assets."
