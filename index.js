const express = require("express");
const app = express();
const port = 3000;

let validateCardNo = require("./Utils/Luhn10");
let {
  getErrorResponse,
  getSuccessResponse,
  getChargeSuccessResponse,
} = require("./Utils/Responses");
let {
  newCardDataValidator,
  chargeValidator,
  creditValidator,
} = require("./Utils/ValidatorUtils");
let { amountToValue } = require("./Utils/AmountUtils");

const NodeCache = require("node-cache");
const myCache = new NodeCache();

app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      //Checking if the input is a valid JSON or not.
      try {
        JSON.parse(buf);
      } catch (e) {
        res
          .status(400)
          .send(getErrorResponse(400, "Invalid JSON request format"));
      }
    },
  })
);

//Getting all cards data
app.get("/", (req, res) => {
  let cards = [];
  let myKeys = myCache.keys();
  if (myKeys.length <= 0) {
    res.status(404).send(getErrorResponse(404, "Cards DB is empty"));
  } else {
    myKeys.forEach((card) => {
      let cardData = myCache.get(card);
      cardData.card_no = card;
      cards.push(cardData);
    });
    res.status(200).send({'status': 200, cards});
  }
});

//Add new card
app.post("/add", function (req, res) {
  let name = req.body.name;
  let card_no = req.body.card_no;
  let limit = req.body.limit;

  let result = newCardDataValidator(name, card_no, limit);

  if (result !== "Success") {
    //Validation error occurs
    res.status(400).send(getErrorResponse(400, result));
  } else {
    card_no = card_no.replace(/\D/g, "");
    if (myCache.has(card_no)) {
      // Card already exists in the DB
      let card_details = myCache.get(card_no);
      res
        .status(200)
        .send(
          getSuccessResponse(200, "Card already exists", card_no, card_details)
        );
    } else {
      // Card doesn't exists in the DB
      limit = "£" + amountToValue(limit);
      let success = myCache.set(card_no, {
        name,
        limit,
        balance: "£0",
      });
      if (success) {
        // Card created successfully
        let card_details = myCache.get(card_no);
        res
          .status(201)
          .send(
            getSuccessResponse(
              201,
              "Card created successfully",
              card_no,
              card_details
            )
          );
      } else {
        res
          .status(500)
          .send(getErrorResponse(500, "Unknown server error", card_no));
      }
    }
  }
});

//Charge the card
app.put("/charge", function (req, res) {
  let card_no = req.body.card_no;
  let charge = req.body.charge;
  let result = chargeValidator(charge);

  if (!card_no) {
    //Card number does not exists in request
    res
      .status(400)
      .send(
        getErrorResponse(400, "Card number length should be between 3 and 19.")
      );
  } else if (result !== "Success") {
    // Validation errors are there
    res.status(400).send(getErrorResponse(400, result));
  } else {
    card_no = card_no.replace(/\D/g, "");
    if (!myCache.has(card_no)) {
      // Card number does not exists in DB
      res
        .status(400)
        .send(getErrorResponse(400, "Card number does not exists"));
    } else {
      // Card number exists in DB
      let card_details = myCache.get(card_no);

      charge = amountToValue(charge);
      let limit = amountToValue(card_details.limit);
      let balance = amountToValue(card_details.balance);

      if (charge + balance > limit) {
        //Charge not authorized
        res
          .status(405)
          .send(
            getErrorResponse(400, "Charge not authorized. Limit exceeded.")
          );
      } else {
        //Charge is authorized
        balance += charge;
        let remaining_balance = limit - balance;
        remaining_balance = "£" + remaining_balance.toFixed(2);
        card_details.balance = "£" + balance.toFixed(2);
        myCache.set(card_no, card_details);

        res
          .status(200)
          .send(
            getChargeSuccessResponse(
              200,
              "Transaction successful. Card has been charged.",
              card_no,
              remaining_balance
            )
          );
      }
    }
  }
});

//Credit the card
app.put("/credit", function (req, res) {
  let card_no = req.body.card_no;
  let credit = req.body.credit;
  let result = creditValidator(credit);

  if (!card_no) {
    //Card number does not exists in request
    res
      .status(400)
      .send(
        getErrorResponse(400, "Card number length should be between 3 and 19.")
      );
  } else if (result !== "Success") {
    // Validation errors are there
    res.status(400).send(getErrorResponse(400, result));
  } else {
    card_no = card_no.replace(/\D/g, "");
    if (!myCache.has(card_no)) {
      // Card number does not exists in DB
      res
        .status(400)
        .send(getErrorResponse(400, "Card number does not exists"));
    } else {
      // Card number exists in DB
      let card_details = myCache.get(card_no);

      credit = amountToValue(credit);
      let balance = amountToValue(card_details.balance);
      let limit = amountToValue(card_details.limit);

      balance -= credit;
      let remaining_balance = limit - balance;
      remaining_balance = "£" + remaining_balance.toFixed(2);
      card_details.balance = "£" + balance.toFixed(2);
      myCache.set(card_no, card_details);

      res
        .status(200)
        .send(
          getChargeSuccessResponse(
            200,
            "Transaction successful. Card has been credited.",
            card_no,
            remaining_balance
          )
        );
    }
  }
});

app.listen(port, () => {
  console.log(`Node app listening at http://localhost:${port}`);
});
