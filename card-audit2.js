'use strict';

const Audit = require('lighthouse').Audit;

const MAX_CARD_TIME = 3000;

class LoadAudit2 extends Audit {
    static get meta() {
        return {
            category: 'MyPerformance',
            name: 'card-audit2',
            description: 'First call to REST service card',
            failureDescription: 'First call to REST service too slow to initialize',
            helpText: 'Used to measure time from navigationStart to when the first call to REST service' +
            ' is executed',

            requiredArtifacts: ['TimeToCard2']
        };
    }

    static audit(artifacts) {
        const loadedTime = artifacts.TimeToCard2;

        const belowThreshold = loadedTime <= MAX_CARD_TIME;

        return {
            rawValue: loadedTime,
            score: belowThreshold
        };
    }
}

module.exports = LoadAudit2;