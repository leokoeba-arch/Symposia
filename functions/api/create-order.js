module.exports = async function (req, res) {
  try {
    const { amount = "15.00", currency = "EUR" } = req.body;
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;  
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const r = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: amount } }],
      }),
    });

    const data = await r.json();
    res.status(200).json({ id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create order failed" });
  }
};
