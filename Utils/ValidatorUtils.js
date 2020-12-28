let validateCardNo = require("./Luhn10");

function newCardDataValidator(name, card_no, limit) {
  if (!name || name.length <= 0) {
    return "Name parameter missing or empty.";
  } else if (!card_no || card_no.length < 3 || card_no.length > 19) {
    return "Card number length should be between 3 and 19.";
  } else if (!validateCardNo(card_no).status) {
    return "Invalid card number.";
  } else if (!limit || limit.length <= 0) {
    return "Limit parameter missing or empty.";
  } else if (!/^£[0-9.]+$/.test(limit)) {
    return "Invalid limit amount.";
  } else {
    return "Success";
  }
}

function chargeValidator(charge) {
 if (!charge || charge.length <= 0) {
    return "Charge parameter missing or empty.";
  } else if (!/^£[0-9.]+$/.test(charge)) {
    return "Invalid charge amount.";
  } else {
    return "Success";
  }
}

function creditValidator(credit) {
  if (!credit || credit.length <= 0) {
    return "Credit parameter missing or empty.";
  } else if (!/^£[0-9.]+$/.test(credit)) {
    return "Invalid credit amount.";
  } else {
    return "Success";
  }
}

module.exports = {
  newCardDataValidator,
  chargeValidator,
  creditValidator,
};
