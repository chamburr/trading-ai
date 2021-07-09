class Item {
    constructor(data, prev, next) {
        this.next = next;
        if (next) next.prev = this;

        this.prev = prev;
        if (prev) prev.next = this;

        this.data = data;
    }
}

class LinkedList {
    constructor() {
        this._length = 0;
    }

    get head() {
        return this._head && this._head.data;
    }

    get tail() {
        return this._tail && this._tail.data;
    }

    get current() {
        return this._current && this._current.data;
    }

    get length() {
        return this._length;
    }

    push(data) {
        this._tail = new Item(data, this._tail);
        if (this._length === 0) {
            this._head = this._tail;
            this._current = this._head;
            this._next = this._head;
        }

        this._length++;
    }

    pop() {
        let tail = this._tail;

        if (this._length === 0) {
            return;
        }

        this._length--;

        if (this._length === 0) {
            this._head = this._tail = this._current = this._next = undefined;
            return tail.data;
        }

        this._tail = tail.prev;
        this._tail.next = undefined;

        if (this._current === tail) {
            this._current = this._tail;
            this._next = undefined;
        }

        return tail.data;
    }

    shift() {
        let head = this._head;

        if (this._length === 0) {
            return;
        }

        this._length--;

        if (this._length === 0) {
            this._head = this._tail = this._current = this._next = undefined;
            return head.data;
        }

        this._head = this._head.next;

        if (this._current === head) {
            this._current = this._head;
            this._next = this._current.next;
        }

        return head.data;
    }

    unshift(data) {
        this._head = new Item(data, undefined, this._head);

        if (this._length === 0) {
            this._tail = this._head;
            this._next = this._head;
        }

        this._length++;
    }

    unshiftCurrent() {
        let current = this._current;

        if (current === this._head || this._length < 2) {
            return current && current.data;
        }

        if (current === this._tail) {
            this._tail = current.prev;
            this._tail.next = undefined;
            this._current = this._tail;
        }
        else {
            current.next.prev = current.prev;
            current.prev.next = current.next;
            this._current = current.prev;
        }

        this._next = this._current.next;

        current.next = this._head;
        current.prev = undefined;

        this._head.prev = current;
        this._head = current;

        return current.data;
    }

    removeCurrent() {
        let current = this._current;

        if (this._length === 0) {
            return;
        }

        this._length--;

        if (this._length === 0) {
            this._head = this._tail = this._current = this._next = undefined;
            return current.data;
        }

        if (current === this._tail) {
            this._tail = current.prev;
            this._tail.next = undefined;
            this._current = this._tail;
        }
        else if (current === this._head) {
            this._head = current.next;
            this._head.prev = undefined;
            this._current = this._head;
        }
        else {
            current.next.prev = current.prev;
            current.prev.next = current.next;
            this._current = current.prev;
        }

        this._next = this._current.next;

        return current.data;
    }

    resetCursor() {
        this._current = this._next = this._head;
        return this;
    }

    next() {
        let next = this._next;

        if (next !== undefined) {
            this._next = next.next;
            this._current = next;

            return next.data;
        }
    }
}

function nf(v) {
    return v;
}

class Indicator {
    constructor(input) {
        this.format = input.format || nf;
    }

    getResult() {
        return this.result;
    }
}

class SMA extends Indicator {
    constructor(input) {
        super(input);
        this.period = input.period;
        this.price = input.values;

        let genFn = (function* (period) {
            let list = new LinkedList();
            let sum = 0;
            let counter = 1;
            let current = yield;
            let result;

            list.push(0);

            while (true) {
                if (counter < period) {
                    counter++;
                    list.push(current);
                    sum = sum + current;
                }
                else {
                    sum = sum - list.shift() + current;
                    result = ((sum) / period);
                    list.push(current);
                }

                current = yield result;
            }
        });

        this.generator = genFn(this.period);
        this.generator.next();
        this.result = [];
        this.price.forEach((tick) => {
            let result = this.generator.next(tick);
            if (result.value !== undefined) {
                this.result.push(this.format(result.value));
            }
        });
    }

    nextValue(price) {
        let result = this.generator.next(price).value;
        if (result != undefined) return this.format(result);
    }
}

class EMA extends Indicator {
    constructor(input) {
        super(input);

        let period = input.period;
        let priceArray = input.values;
        let exponent = (2 / (period + 1));
        let sma;

        this.result = [];

        sma = new SMA({ period: period, values: [] });

        let genFn = (function* () {
            let tick = yield;
            let prevEma;

            while (true) {
                if (prevEma !== undefined && tick !== undefined) {
                    prevEma = ((tick - prevEma) * exponent) + prevEma;
                    tick = yield prevEma;
                }
                else {
                    tick = yield;
                    prevEma = sma.nextValue(tick);
                    if (prevEma) tick = yield prevEma;
                }
            }
        });

        this.generator = genFn();
        this.generator.next();
        this.generator.next();

        priceArray.forEach((tick) => {
            let result = this.generator.next(tick);
            if (result.value != undefined) {
                this.result.push(this.format(result.value));
            }
        });
    }

    nextValue(price) {
        let result = this.generator.next(price).value;
        if (result != undefined) return this.format(result);
    }
}

class WMA extends Indicator {
    constructor(input) {
        super(input);

        let period = input.period;
        let priceArray = input.values;

        this.result = [];
        this.generator = (function* () {
            let data = new LinkedList();
            let denominator = period * (period + 1) / 2;

            while (true) {
                if ((data.length) < period) {
                    data.push(yield);
                }
                else {
                    data.resetCursor();

                    let result = 0;

                    for (let i = 1; i <= period; i++) {
                        result = result + (data.next() * i / (denominator));
                    }

                    let next = yield result;

                    data.shift();
                    data.push(next);
                }
            }
        })();

        this.generator.next();

        priceArray.forEach(tick => {
            let result = this.generator.next(tick);
            if (result.value != undefined) {
                this.result.push(this.format(result.value));
            }
        });
    }

    nextValue(price) {
        let result = this.generator.next(price).value;
        if (result != undefined) return this.format(result);
    }
}

class VWAP extends Indicator {
    constructor(input) {
        super(input);

        let lows = input.low;
        let highs = input.high;
        let closes = input.close;
        let volumes = input.volume;

        if (!((lows.length === highs.length) && (highs.length === closes.length))) {
            throw ('Inputs(low,high, close) not of equal size');
        }

        this.result = [];
        this.generator = (function* () {
            let tick = yield;
            let cumulativeTotal = 0;
            let cumulativeVolume = 0;

            while (true) {
                let typicalPrice = (tick.high + tick.low + tick.close) / 3;
                let total = tick.volume * typicalPrice;

                cumulativeTotal = cumulativeTotal + total;
                cumulativeVolume = cumulativeVolume + tick.volume;
                tick = yield cumulativeTotal / cumulativeVolume;
            }
        })();

        this.generator.next();

        lows.forEach((tick, index) => {
            let result = this.generator.next({
                high: highs[index],
                low: lows[index],
                close: closes[index],
                volume: volumes[index]
            });

            if (result.value != undefined) {
                this.result.push(result.value);
            }
        });
    }

    nextValue(price) {
        let result = this.generator.next(price).value;
        if (result != undefined) return result;
    }
}

class AverageGain extends Indicator {
    constructor(input) {
        super(input);

        let values = input.values;
        let period = input.period;
        let format = this.format;

        this.generator = (function* (period) {
            let currentValue = yield;
            let counter = 1;
            let gainSum = 0;
            let avgGain;
            let gain;
            let lastValue = currentValue;

            currentValue = yield;

            while (true) {
                gain = currentValue - lastValue;
                gain = gain > 0 ? gain : 0;

                if (gain > 0) {
                    gainSum = gainSum + gain;
                }

                if (counter < period) {
                    counter++;
                }
                else if (avgGain === undefined) {
                    avgGain = gainSum / period;
                }
                else {
                    avgGain = ((avgGain * (period - 1)) + gain) / period;
                }

                lastValue = currentValue;
                avgGain = (avgGain !== undefined) ? format(avgGain) : undefined;
                currentValue = yield avgGain;
            }
        })(period);

        this.generator.next();
        this.result = [];

        values.forEach((tick) => {
            let result = this.generator.next(tick);
            if (result.value !== undefined) {
                this.result.push(result.value);
            }
        });
    }

    nextValue(price) {
        return this.generator.next(price).value;
    }
}

class AverageLoss extends Indicator {
    constructor(input) {
        super(input);

        let values = input.values;
        let period = input.period;
        let format = this.format;

        this.generator = (function* (period) {
            let currentValue = yield;
            let counter = 1;
            let lossSum = 0;
            let avgLoss;
            let loss;
            let lastValue = currentValue;

            currentValue = yield;

            while (true) {
                loss = lastValue - currentValue;
                loss = loss > 0 ? loss : 0;

                if (loss > 0) {
                    lossSum = lossSum + loss;
                }

                if (counter < period) {
                    counter++;
                }
                else if (avgLoss === undefined) {
                    avgLoss = lossSum / period;
                }
                else {
                    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
                }

                lastValue = currentValue;
                avgLoss = (avgLoss !== undefined) ? format(avgLoss) : undefined;
                currentValue = yield avgLoss;
            }
        })(period);

        this.generator.next();
        this.result = [];

        values.forEach((tick) => {
            let result = this.generator.next(tick);
            if (result.value !== undefined) {
                this.result.push(result.value);
            }
        });
    }

    nextValue(price) {
        return this.generator.next(price).value;
    }
}

class RSI extends Indicator {
    constructor(input) {
        super(input);

        let period = input.period;
        let values = input.values;
        let GainProvider = new AverageGain({ period: period, values: [] });
        let LossProvider = new AverageLoss({ period: period, values: [] });

        this.generator = (function* () {
            let current = yield;
            let lastAvgGain, lastAvgLoss, RS, currentRSI;

            while (true) {
                lastAvgGain = GainProvider.nextValue(current);
                lastAvgLoss = LossProvider.nextValue(current);

                if ((lastAvgGain !== undefined) && (lastAvgLoss !== undefined)) {
                    if (lastAvgLoss === 0) {
                        currentRSI = 100;
                    }
                    else if (lastAvgGain === 0) {
                        currentRSI = 0;
                    }
                    else {
                        RS = lastAvgGain / lastAvgLoss;
                        RS = isNaN(RS) ? 0 : RS;
                        currentRSI = parseFloat((100 - (100 / (1 + RS))).toFixed(2));
                    }
                }

                current = yield currentRSI;
            }
        })(period);

        this.generator.next();
        this.result = [];

        values.forEach((tick) => {
            let result = this.generator.next(tick);
            if (result.value !== undefined) {
                this.result.push(result.value);
            }
        });
    }

    nextValue(price) {
        return this.generator.next(price).value;
    }
}

export { SMA, EMA, WMA, VWAP, RSI };
