#!/bin/bash
#
# Generate padded favicon PNGs for Google's circular crop
#
# Usage:
#   ./generate-favicons.sh solid /path/to/static/
#   ./generate-favicons.sh outlined /path/to/static/
#
# Generates:
#   - apple-touch-icon.png (180x180)
#   - icon-192.png (192x192)
#   - icon-512.png (512x512)
#   - icon-maskable.png (512x512)
#
# The square is 62.5% of canvas size, leaving 18.75% padding on each side.
# This ensures the icon fits within Google's circular crop mask.

set -e

STYLE="${1:-solid}"
OUTPUT_DIR="${2:-.}"

# Brand color
ORANGE="#F84200"

# Icon sizes to generate
SIZES=(180 192 512)

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

generate_icon() {
    local size=$1
    local output=$2

    # Calculate dimensions (62.5% square, centered)
    # Using bash arithmetic: size * 5 / 8 = 62.5%
    local square_size=$((size * 5 / 8))
    local padding=$(((size - square_size) / 2))

    # For outlined style, stroke width is 12.5% of canvas (matching SVG ratio of 4/32)
    # Using bash arithmetic: size / 8 = 12.5%
    local stroke_width=$((size / 8))

    # Calculate rectangle end coordinates
    local end=$((padding + square_size - 1))

    if [[ "$STYLE" == "solid" ]]; then
        # Solid filled square
        magick -size "${size}x${size}" xc:white \
            -fill "$ORANGE" \
            -draw "rectangle $padding,$padding $end,$end" \
            "$output"
    else
        # Outlined square (stroke inside the bounding box)
        # Adjust rect position to account for stroke being centered on path
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

    echo "  Created: $output (${size}x${size})"
}

# Generate each size
for size in "${SIZES[@]}"; do
    case $size in
        180)
            generate_icon "$size" "$OUTPUT_DIR/apple-touch-icon.png"
            ;;
        192)
            generate_icon "$size" "$OUTPUT_DIR/icon-192.png"
            ;;
        512)
            generate_icon "$size" "$OUTPUT_DIR/icon-512.png"
            generate_icon "$size" "$OUTPUT_DIR/icon-maskable.png"
            ;;
    esac
done

echo "Done! Generated $(( ${#SIZES[@]} + 1 )) icons."
