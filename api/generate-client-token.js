export default async function handler(req, res) {
    const PAYPAL_CLIENT_ID = "AaHHjnLLDz236rS7ZLx1A_qKJEllD2AC1khW5uAkUessfroBrenm0SkRcy942w0CuQ3o9uB83mgd9k5y"
    const PAYPAL_SECRET = "ENVbZDl2P_SWrMokzyUs0LEgFSy3TGrpEdFbQ5-0FJqhZVOZtvexB6whlNC-Hc2w5-NNg35K6DYo5uR1"

  try {
    const r = await fetch("https://api-m.sandbox.paypal.com/v1/identity/generate-token", {
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
