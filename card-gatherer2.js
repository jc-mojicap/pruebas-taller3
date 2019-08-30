'use strict';

const Gatherer = require('lighthouse').Gatherer;

class TimeToCard2 extends Gatherer {
    afterPass(options) {
        const driver = options.driver;

        return driver.evaluateAsync('window.cardFirstLoadTime')
            .then(cardFirstLoadTime => {
                if (!cardFirstLoadTime) {

                    throw new Error('Unable to find card load metrics in page');
                }
                return cardFirstLoadTime;
            });
    }
}

module.exports = TimeToCard2;