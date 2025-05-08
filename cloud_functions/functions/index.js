const { onRequest } = require("firebase-functions/v2/https");
const jwt = require("jsonwebtoken");
const jwks = require("jwks-rsa");
const firebaseAdmin = require("firebase-admin");
const authgearEndpoint = "https://cube-crisp-110.authgear-staging.com"; //place your authgear app endpoint here

// Get JWKs URI from Open ID Configuration documents
const getJwksUri = async (authgearEndpoint) => {
  const config_endpoint =
    authgearEndpoint + "/.well-known/openid-configuration";
  const response = await fetch(config_endpoint);
  const data = await response.json();
  return data.jwks_uri;
};

// Options for JWT verification
const options = {
  algorithms: ["RS256"],
  issuer: authgearEndpoint,
};

const checkReq = (req) => {
  const headerErr = ["must specify an Authorization header", null];
  const formatErr = ["format is 'Authorization: Bearer <token>'", null];
  if (!req) return "server error (request was invalid)";
  const { headers } = req;
  if (!headers) return headerErr; // missing header
  const { authorization } = headers;
  if (!authorization) return headerErr; // missing Authorization Header
  const parts = authorization.split(" ");
  if (parts.length != 2) return formatErr; // Authorization header format invalid
  const [scheme, credentials] = parts;
  if (!/^Bearer$/i.test(scheme)) return formatErr; // Authorization header is not Bearer
  return [false, credentials];
};

firebaseAdmin.initializeApp();

exports.getFirebaseToken = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Authorization");
    res.set("Access-Control-Max-Age", "3600");
    return res.status(204).send("");
  }

  const [message, token] = checkReq(req);
  if (message) {
    return res.status(500).send({ message }); // return error message if checkReq failed
  } else {
    const decodedAccessToken = jwt.decode(token, { complete: true });
    // get signing key from JWKs with the "kid" in decoded access token
    jwksUri = await getJwksUri(authgearEndpoint);
    const client = jwks({
      rateLimit: true,
      strictSsl: true,
      jwksUri: jwksUri,
    });
    const signingKey = await client.getSigningKey(
      decodedAccessToken.header.kid
    );
    try {
      const decoded = jwt.verify(token, signingKey.publicKey, options); // verify jwt
      const uid = decoded.sub; // if the jwt is verified, use "sub" in JWT as uid
      const firebaseToken = await firebaseAdmin.auth().createCustomToken(uid); // create Firebase custom token with uid
      return res.json({ firebaseToken }); // return Firebase custom token
    } catch (err) {
      return res.status(500).send(err);
    }
  }
});