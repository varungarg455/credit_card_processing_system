function getErrorResponse(code, message, card_no) {
  return { status: "error", code, message, card_no };
}

function getSuccessResponse(code, message, card_no, card_details) {
  return { status: "success", code: code, message: message, card_no, card_details };
}

function getChargeSuccessResponse(code, message, card_no, remaining_balance) {
  return {
    status: "success",
    code: code,
    message: message,
    card_no,
    remaining_balance
  };
}

module.exports = {
  getErrorResponse,
  getSuccessResponse,
  getChargeSuccessResponse,
};
