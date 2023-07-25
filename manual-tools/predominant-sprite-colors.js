const path = require('path');
const getColors = require('get-image-colors');
const fsPromise = require('fs/promises');
const fs = require('fs');

function applySaturationToHexColor(hex, saturationPercent) {
    if (!/^#([0-9a-f]{6})$/i.test(hex)) {
        throw 'Unexpected color format';
    }

    if (saturationPercent < 0 || saturationPercent > 100) {
        throw 'Unexpected color format';
    }

    var saturationFloat = saturationPercent / 100,
        rgbIntensityFloat = [
            parseInt(hex.substr(1, 2), 16) / 255,
            parseInt(hex.substr(3, 2), 16) / 255,
            parseInt(hex.substr(5, 2), 16) / 255,
        ];

    var rgbIntensityFloatSorted = rgbIntensityFloat
            .slice(0)
            .sort(function (a, b) {
                return a - b;
            }),
        maxIntensityFloat = rgbIntensityFloatSorted[2],
        mediumIntensityFloat = rgbIntensityFloatSorted[1],
        minIntensityFloat = rgbIntensityFloatSorted[0];

    if (maxIntensityFloat == minIntensityFloat) {
        // All colors have same intensity, which means
        // the original color is gray, so we can't change saturation.
        return hex;
    }

    // New color max intensity wont change. Lets find medium and weak intensities.
    var newMediumIntensityFloat,
        newMinIntensityFloat = maxIntensityFloat * (1 - saturationFloat);

    if (mediumIntensityFloat == minIntensityFloat) {
        // Weak colors have equal intensity.
        newMediumIntensityFloat = newMinIntensityFloat;
    } else {
        // Calculate medium intensity with respect to original intensity proportion.
        var intensityProportion =
            (maxIntensityFloat - mediumIntensityFloat) /
            (mediumIntensityFloat - minIntensityFloat);
        newMediumIntensityFloat =
            (intensityProportion * newMinIntensityFloat + maxIntensityFloat) /
            (intensityProportion + 1);
    }

    var newRgbIntensityFloat = [],
        newRgbIntensityFloatSorted = [
            newMinIntensityFloat,
            newMediumIntensityFloat,
            maxIntensityFloat,
        ];

    // We've found new intensities, but we have then sorted from min to max.
    // Now we have to restore original order.
    rgbIntensityFloat.forEach(function (originalRgb) {
        var rgbSortedIndex = rgbIntensityFloatSorted.indexOf(originalRgb);
        newRgbIntensityFloat.push(newRgbIntensityFloatSorted[rgbSortedIndex]);
    });

    var floatToHex = function (val) {
            return ('0' + Math.round(val * 255).toString(16)).substr(-2);
        },
        rgb2hex = function (rgb) {
            return (
                '#' +
                floatToHex(rgb[0]) +
                floatToHex(rgb[1]) +
                floatToHex(rgb[2])
            );
        };

    var newHex = rgb2hex(newRgbIntensityFloat);

    return newHex;
}

const spriteNames = fs.readdirSync(
    path.resolve(__dirname, '../data/icons/hires')
);

async function init() {
    const results = await Promise.all(
        spriteNames.map(async (spriteName, index) => {
            try {
                const pathResolved = path.resolve(
                    __dirname,
                    `../data/icons/hires/${spriteName}`
                );

                const imageColors = (
                    await getColors(pathResolved, {
                        count: 2,
                        type: 'image/png',
                    })
                ).map((color) => {
                    // Reduce opacity to 0.5
                    const colorValues = color.hex('rgb').slice(0, 7);
                    const opacity = '66';
                    // return colorValues + opacity;
                    return applySaturationToHexColor(colorValues, 50) + opacity;
                });

                return { imageColors, id: +spriteName.split('.')[0] };
            } catch (err) {
                console.log(err);
                return null;
            }
        })
    );

    const classes = results
        .filter(Boolean)
        .map((result, index) => {
            return `.pokemon-${result.id} {
            background: linear-gradient(45deg, ${result.imageColors[0]}, ${result.imageColors[1]});
        }`;
        })
        .join('\n');

    await fsPromise.writeFile(
        path.resolve(__dirname, '../data/styles/pokemon-gradients.css'),
        classes
    );
}
init();
