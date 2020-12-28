module.exports = function validateLuhn(card_no) {
  if (!card_no) {
    card_no = "";
  }

  // Check if card number only contains digits, dashes or spaces
  if (/[^0-9-\s]+/.test(card_no)) {
    return { card_no, status: false };
  }

  // The Luhn Algorithm
  let nCheck = 0,
    bEven = false;
  card_no = card_no.replace(/\D/g, "");

  for (let i = card_no.length - 1; i >= 0; i--) {
    let cDigit = card_no.charAt(i),
      nDigit = parseInt(cDigit, 10);

    if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

    nCheck += nDigit;
    bEven = !bEven;
  }

  let status = nCheck % 10 == 0;
  return { card_no, status };
};
