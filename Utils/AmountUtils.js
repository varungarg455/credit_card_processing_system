function amountToValue(amount){
    return Number(parseFloat(amount.substr(1)).toFixed(2));
}

module.exports = {
    amountToValue
}