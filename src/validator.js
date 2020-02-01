export default class Validator {

    constructor(boxWidth, boxHeight, nums) {
        this.boxWidth = boxWidth;
        this.boxHeight = boxHeight;
        this.nums = nums;
        this.size = boxWidth * boxHeight;
    }

    display() {
        this.nums.forEach((row) => {
            console.log(row);
        });
    }

    validRow(rowNum) {
        let counts = new Array(this.size).fill();
        for (let colNum = 0; colNum < this.size; colNum++) {
            let num = this.nums[rowNum][colNum];
            if (num) {
                if (counts[num - 1]) {
                    return false;
                }
                counts[num - 1] = 1;
            }
        }
        return true;
    }

    validCol(colNum) {
        let counts = new Array(this.size).fill();
        for (let rowNum = 0; rowNum < this.size; rowNum++) {
            let num = this.nums[rowNum][colNum];
            if (num) {
                if (counts[num - 1]) {
                    return false;
                }
                counts[num - 1] = 1;
            }
        }
        return true;
    }

    validBox(boxNum) {
        let counts = new Array(this.size).fill();
        for (let boxRowNum = 0; boxRowNum < this.boxHeight; boxRowNum++) {
            for (let boxColNum = 0; boxColNum < this.boxWidth; boxColNum++) {

                let rowNum = boxRowNum +
                    (this.boxHeight * Math.floor(boxNum / this.boxHeight));
                let colNum = boxColNum +
                    (this.boxWidth * (boxNum % this.boxWidth));

                let num = this.nums[rowNum][colNum];
                if (num) {
                    if (counts[num - 1]) {
                        return false;
                    }
                    counts[num - 1] = 1;
                }
            }
        }
        return true;
    }

    isValid() {
        for (let i = 0; i < this.size; i++) {
            if (!(this.validRow(i) && this.validCol(i) && this.validBox(i))) {
                return false;
            }
        }
        return true;
    }

    isWon() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (!this.nums[row][col]) {
                    return false;
                }
            }
        }
        return this.isValid();
    }

}
