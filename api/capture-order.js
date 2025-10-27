export default async function handler(req, res) {
  try {
    const { orderID } = req.body;
    const PAYPAL_CLIENT_ID = "AbQKnpmdcDP3BhtHKRWVHeq8CvGHOVizpSp0uyRijEAmnPZsMg_4Mwh2pf_G2kVwoaYfK0s2NBvDXuhe"
    const PAYPAL_SECRET = "EFJcCncYFw9Pp0dvN25OHcrv-vjRYOOWixCqM3umPwhLCR7oKhBpAmc9ElLn4LD8sepFVWfyX-NaTJYx"

    const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET).toString("base64")}`
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Capture failed" });
  }
}
