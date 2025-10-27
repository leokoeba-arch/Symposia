export default async function handler(req, res) {
    const PAYPAL_CLIENT_ID = "AbQKnpmdcDP3BhtHKRWVHeq8CvGHOVizpSp0uyRijEAmnPZsMg_4Mwh2pf_G2kVwoaYfK0s2NBvDXuhe"
    const PAYPAL_SECRET = "EFJcCncYFw9Pp0dvN25OHcrv-vjRYOOWixCqM3umPwhLCR7oKhBpAmc9ElLn4LD8sepFVWfyX-NaTJYx"

  try {
    const r = await fetch("https://api-m.paypal.com/v1/identity/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // usa le stesse env che hai già messo su Vercel
        "Authorization": "Basic " + Buffer
          .from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET)
          .toString("base64")
      }
    });
    const data = await r.json(); // { client_token: "..." }
    if (!data.client_token) {
      return res.status(500).json({ error: "Missing client_token", data });
    }
    res.status(200).json({ clientToken: data.client_token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Client token failed" });
  }
}
