export default async function handler(req, res) {
  try {
    const { amount, currency } = req.body;
    const PAYPAL_CLIENT_ID = "AaHHjnLLDz236rS7ZLx1A_qKJEllD2AC1khW5uAkUessfroBrenm0SkRcy942w0CuQ3o9uB83mgd9k5y"
    const PAYPAL_SECRET = "ENVbZDl2P_SWrMokzyUs0LEgFSy3TGrpEdFbQ5-0FJqhZVOZtvexB6whlNC-Hc2w5-NNg35K6DYo5uR1"

    const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET).toString("base64")}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency || "EUR",
              value: amount || "15.00"
            }
          }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create order failed" });
  }
}
