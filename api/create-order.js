export default async function handler(req, res) {
  try {
    const { amount, currency } = req.body;
    const PAYPAL_CLIENT_ID = "AbQKnpmdcDP3BhtHKRWVHeq8CvGHOVizpSp0uyRijEAmnPZsMg_4Mwh2pf_G2kVwoaYfK0s2NBvDXuhe"
    const PAYPAL_SECRET = "EFJcCncYFw9Pp0dvN25OHcrv-vjRYOOWixCqM3umPwhLCR7oKhBpAmc9ElLn4LD8sepFVWfyX-NaTJYx"

    const response = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
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
