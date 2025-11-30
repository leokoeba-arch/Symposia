module.exports = async function (req, res) {
  try {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");

    const r = await fetch("https://api-m.paypal.com/v1/identity/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await r.json();
    if (!data.client_token) {
      return res.status(500).json({ error: "Missing client_token", data });
    }

    res.status(200).json({ clientToken: data.client_token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Client token failed" });
  }
};
