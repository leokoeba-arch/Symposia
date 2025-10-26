export default async function handler(req, res) {
  try {
    const { orderID } = req.body;
    const PAYPAL_CLIENT_ID = "AaHHjnLLDz236rS7ZLx1A_qKJEllD2AC1khW5uAkUessfroBrenm0SkRcy942w0CuQ3o9uB83mgd9k5y"
    const PAYPAL_SECRET = "ENVbZDl2P_SWrMokzyUs0LEgFSy3TGrpEdFbQ5-0FJqhZVOZtvexB6whlNC-Hc2w5-NNg35K6DYo5uR1"

    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
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
