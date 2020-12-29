const request = require("supertest");
const app = require("../index");

describe("Card DB is empty", () => {
  it("Should return an error", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(404);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Cards DB is empty");
  });
});

describe("Adding a new card", () => {
  it("Valid request - success message ", async () => {
    const res = await request(app).post("/add").send({
      name: "varun",
      card_no: "12345674",
      limit: "£50.257",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual("success");
    expect(res.body.message).toEqual("Card created successfully");
    expect(res.body.card_no).toEqual("12345674");
    expect(res.body.card_details).toEqual({
      name: "varun",
      limit: "£50.26",
      balance: "£0",
    });
  });

  it("Get all cards", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("success");
    expect(res.body.cards).toEqual([
      {
        name: "varun",
        limit: "£50.26",
        balance: "£0",
        card_no: "12345674",
      },
    ]);
  });

  it("Card already exists - success message ", async () => {
    const res = await request(app).post("/add").send({
      name: "varun",
      card_no: "12345674",
      limit: "£50.257",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("success");
    expect(res.body.message).toEqual("Card already exists");
    expect(res.body.card_no).toEqual("12345674");
    expect(res.body.card_details).toEqual({
      name: "varun",
      limit: "£50.26",
      balance: "£0",
    });
  });

  it("Invalid name - error message ", async () => {
    const res = await request(app).post("/add").send({
      name: "",
      card_no: "12345674",
      limit: "£50.257",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Name parameter missing or empty.");
  });

  it("Invalid card number length - error message ", async () => {
    const res = await request(app).post("/add").send({
      name: "varun",
      card_no: "12",
      limit: "£50.257",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual(
      "Card number length should be between 3 and 19."
    );
  });

  it("Invalid card number (Luhn10 failed) - error message ", async () => {
    const res = await request(app).post("/add").send({
      name: "varun",
      card_no: "1234578",
      limit: "£50.257",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Invalid card number.");
  });

  it("Invalid limit amount - error message ", async () => {
    const res = await request(app).post("/add").send({
      name: "varun",
      card_no: "12345674",
      limit1: "£50.257",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Limit parameter missing or empty.");
  });

  it("Limit value not containing £ symbol - error message ", async () => {
    const res = await request(app).post("/add").send({
      name: "varun",
      card_no: "12345674",
      limit: "50.257",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Invalid limit amount.");
  });
});

describe("Charging the card", () => {
  it("Valid request - success message ", async () => {
    const res = await request(app).put("/charge").send({
      card_no: "12345674",
      charge: "£5.2579",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("success");
    expect(res.body.message).toEqual(
      "Transaction successful. Card has been charged."
    );
    expect(res.body.card_no).toEqual("12345674");
    expect(res.body.remaining_balance).toEqual("£45.00");
  });

  it("Card does not exists - error message ", async () => {
    const res = await request(app).put("/charge").send({
      card_no: "12",
      charge: "£5.2579",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Card number does not exists");
  });

  it("Invalid charge - error message ", async () => {
    const res = await request(app).put("/charge").send({
      card_no: "12345674",
      charge1: "£5.2579",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Charge parameter missing or empty.");
  });

  it("Charge value not containing £ symbol - error message ", async () => {
    const res = await request(app).put("/charge").send({
      card_no: "12345674",
      charge: "5.2579",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Invalid charge amount.");
  });

  it("Limit exceeded - error message ", async () => {
    const res = await request(app).put("/charge").send({
      card_no: "12345674",
      charge: "£500.2579",
    });
    expect(res.statusCode).toEqual(405);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Charge not authorized. Limit exceeded.");
  });
});

describe("Crediting the card", () => {
  it("Valid request - success message ", async () => {
    const res = await request(app).put("/credit").send({
      card_no: "12345674",
      credit: "£1.2579",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual("success");
    expect(res.body.message).toEqual(
      "Transaction successful. Card has been credited."
    );
    expect(res.body.card_no).toEqual("12345674");
    expect(res.body.remaining_balance).toEqual("£46.26");
  });

  it("Card does not exists - error message ", async () => {
    const res = await request(app).put("/credit").send({
      card_no: "12",
      credit: "£1.2579",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Card number does not exists");
  });

  it("Invalid credit - error message ", async () => {
    const res = await request(app).put("/credit").send({
      card_no: "12345674",
      credit1: "£1.2579",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Credit parameter missing or empty.");
  });

  it("Credit value not containing £ symbol - error message ", async () => {
    const res = await request(app).put("/credit").send({
      card_no: "12345674",
      credit: "1.2579",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual("error");
    expect(res.body.message).toEqual("Invalid credit amount.");
  });
});

afterAll((done) => {
  app.close();
  done();
});
