module.exports = async function (req, res) {
  try {
    const { orderID } = req.body;
    const PAYPAL_CLIENT_ID = "AbQKnpmdcDP3BhtHKRWVHeq8CvGHOVizpSp0uyRijEAmnPZsMg_4Mwh2pf_G2kVwoaYfK0s2NBvDXuhe";
    const PAYPAL_SECRET = "EFJcCncYFw9Pp0dvN25OHcrv-vjRYOOWixCqM3umPwhLCR7oKhBpAmc9ElLn4LD8sepFVWfyX-NaTJYx";
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const r = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Capture failed" });
  }
};
